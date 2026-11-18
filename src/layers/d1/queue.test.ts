import { describe, expect, it } from "@effect/vitest"
import { Effect, Option } from "effect"
import { TestClock } from "effect/testing"
import { DAILY_NEW_PAGES } from "../../core/queue.ts"
import { QueueUnavailable } from "../../services/errors.ts"
import { RequestQueue } from "../../services/ports.ts"
import { memoryD1Client } from "../test/sqlite.ts"
import type { D1Client } from "./client.ts"
import { requestQueueLayer } from "./queue.ts"

const START = Date.UTC(2026, 0, 1, 10)

// マイグレーションを当てたメモリ上のSQLiteに、本番と同じSQLを実行する。
const withQueue = <A, E>(effect: Effect.Effect<A, E, RequestQueue>, client: D1Client = memoryD1Client()) =>
  TestClock.setTime(START).pipe(Effect.andThen(effect), Effect.provide(requestQueueLayer(client)))

const stateOf = (page: string) =>
  RequestQueue.use((queue) => queue.status(page)).pipe(Effect.map(Option.map((status) => status.state)), Effect.map(Option.getOrUndefined))
const positionOf = (page: string) =>
  RequestQueue.use((queue) => queue.status(page)).pipe(
    Effect.map(Option.map((status) => status.position)),
    Effect.map(Option.getOrUndefined)
  )

describe("順番待ちの列", () => {
  it.effect("リクエストの多い順、同数なら古い順に取り出す", () =>
    withQueue(
      Effect.gen(function* () {
        const queue = yield* RequestQueue
        for (const page of ["a", "b", "c", "c"]) {
          yield* queue.add(page)
          yield* TestClock.adjust("1 minute")
        }

        expect(yield* positionOf("c")).toBe(1)
        expect(yield* positionOf("b")).toBe(3)
        expect(yield* queue.takeNext(2)).toStrictEqual(["c", "a"])
        expect(yield* positionOf("b")).toBe(1)
        expect(yield* stateOf("c")).toBe("translating")
        expect(yield* positionOf("c")).toBe(0)
        expect(yield* queue.countQueued).toBe(1)
      })
    )
  )

  it.effect("リクエストされたことが無いページには、状況が無い", () =>
    withQueue(
      Effect.gen(function* () {
        expect(yield* stateOf("never")).toBeUndefined()
      })
    )
  )

  it.effect("訳せなかったページは、時間をおけば訳せるなら列に戻し、そうでなければ失敗にする。失敗は再リクエストで列に戻る", () =>
    withQueue(
      Effect.gen(function* () {
        const queue = yield* RequestQueue
        yield* queue.add("a")
        yield* queue.add("b")
        yield* queue.takeNext(2)
        yield* queue.finish("a", { kind: "requeue", reason: "quota" })
        yield* queue.finish("b", { kind: "failed", reason: "boom" })

        expect(yield* stateOf("a")).toBe("queued")
        expect(yield* stateOf("b")).toBe("failed")

        yield* queue.add("b")

        expect(yield* stateOf("b")).toBe("queued")
      })
    )
  )

  it.effect("訳し終えたページは公開待ちになり、デプロイ後に公開済みになる", () =>
    withQueue(
      Effect.gen(function* () {
        const queue = yield* RequestQueue
        yield* queue.add("a")
        yield* queue.takeNext(1)
        yield* queue.finish("a", { kind: "translated" })

        expect(yield* stateOf("a")).toBe("translated")
        expect(yield* queue.takeNext(1)).toStrictEqual([])

        yield* queue.markPublished

        expect(yield* stateOf("a")).toBe("done")
      })
    )
  )

  it.effect("実行が途中で止まった翻訳中のページは、2時間たったら取り出し直す", () =>
    withQueue(
      Effect.gen(function* () {
        const queue = yield* RequestQueue
        yield* queue.add("a")
        yield* queue.takeNext(1)
        yield* TestClock.adjust("119 minutes")

        expect(yield* queue.takeNext(1)).toStrictEqual([])

        yield* TestClock.adjust("2 minutes")

        expect(yield* queue.takeNext(1)).toStrictEqual(["a"])
      })
    )
  )

  it.effect("1日に受け付ける新しいページの数に上限がある。前にリクエストされたページは数えない", () =>
    withQueue(
      Effect.gen(function* () {
        const queue = yield* RequestQueue
        for (let index = 0; index < DAILY_NEW_PAGES; index += 1) {
          expect(yield* queue.add(`p${index}`)).toBe(true)
        }

        expect(yield* queue.add("extra")).toBe(false)
        expect(yield* queue.add("p0")).toBe(true)

        // UTCの日付が変わると、また受け付ける。
        yield* TestClock.adjust("14 hours")

        expect(yield* queue.add("extra")).toBe(true)
      })
    )
  )

  it.effect("モデルの1日の呼び出し回数を数え、上限を超えたら止める。太平洋時間の日付が変わると戻る", () =>
    withQueue(
      Effect.gen(function* () {
        const queue = yield* RequestQueue

        expect(yield* queue.reserveCall("m", 2)).toBe(true)
        expect(yield* queue.reserveCall("m", 2)).toBe(true)
        expect(yield* queue.reserveCall("m", 2)).toBe(false)
        expect(yield* queue.reserveCall("other", 2)).toBe(true)

        yield* TestClock.adjust("24 hours")

        expect(yield* queue.reserveCall("m", 2)).toBe(true)
      })
    )
  )

  it.effect("ページの名前に引用符があっても、SQLとして解釈させない", () =>
    withQueue(
      Effect.gen(function* () {
        const queue = yield* RequestQueue
        yield* queue.add("a'); DROP TABLE requests; --")

        expect(yield* stateOf("a'); DROP TABLE requests; --")).toBe("queued")
        expect(yield* queue.countQueued).toBe(1)
      })
    )
  )
})

describe("D1の障害", () => {
  const broken: D1Client = { query: () => Effect.fail(new QueueUnavailable({ detail: "down" })) }
  const odd: D1Client = { query: () => Effect.succeed([{ unexpected: true }]) }

  it.effect("SQLを実行できなければQueueUnavailableで失敗する", () =>
    withQueue(
      Effect.gen(function* () {
        expect(yield* Effect.flip(RequestQueue.use((queue) => queue.add("a")))).toStrictEqual(new QueueUnavailable({ detail: "down" }))
      }),
      broken
    )
  )

  it.effect("返ってきた行が決まった形でなければQueueUnavailableで失敗する", () =>
    withQueue(
      Effect.gen(function* () {
        expect(yield* Effect.flip(RequestQueue.use((queue) => queue.countQueued))).toBeInstanceOf(QueueUnavailable)
        expect(yield* Effect.flip(RequestQueue.use((queue) => queue.status("a")))).toBeInstanceOf(QueueUnavailable)
      }),
      odd
    )
  )
})
