import { describe, expect, it } from "@effect/vitest"
import { Cause, Effect, Exit, Option } from "effect"
import type { Segment } from "../core/segment.ts"
import { TestRecorder, testLayer, type TestOptions } from "../layers/test/index.ts"
import { passTime } from "../layers/test/time.ts"
import { ModelRequestFailed, PublishFailed, QuotaExceeded } from "./errors.ts"
import { RequestQueue } from "./ports.ts"
import { runJob } from "./run-job.ts"

const VSCODE = "microsoft/vscode-docs"
const files = {
  [`${VSCODE}:docs/a.md`]: "First page text.\n",
  [`${VSCODE}:docs/b.md`]: "Second page text.\n",
  [`${VSCODE}:docs/c.md`]: "Third page text.\n"
}
const A = "code.visualstudio.com/docs/a"
const B = "code.visualstudio.com/docs/b"
const MISSING = "code.visualstudio.com/docs/missing"

interface Scenario {
  /** 先に列に入れておくページ。 */
  readonly queued?: ReadonlyArray<string>
  /** 列とは別に訳すページ。 */
  readonly urls?: ReadonlyArray<string>
}

const run = (options: TestOptions, scenario: Scenario) =>
  Effect.gen(function* () {
    const queue = yield* RequestQueue
    yield* Effect.forEach(scenario.queued ?? [], (page) => queue.add(page))
    const exit = yield* Effect.exit(passTime(runJob({ urls: scenario.urls ?? [], chain: ["a"] })))
    const states = yield* Effect.forEach([A, B, MISSING], (page) =>
      queue.status(page).pipe(Effect.map(Option.map((status) => status.state)), Effect.map(Option.getOrUndefined))
    )
    return { exit, states, queuedLeft: yield* queue.countQueued, record: yield* (yield* TestRecorder).read }
  }).pipe(Effect.provide(testLayer({ files, ...options })))

const failureOf = (exit: Exit.Exit<unknown, unknown>): unknown =>
  Exit.isFailure(exit) ? Option.getOrUndefined(Cause.findErrorOption(exit.cause)) : undefined

describe("runJob: 列を処理する", () => {
  it.effect("列のページを訳し、公開待ちにして、公開が要ることを伝える", () =>
    Effect.gen(function* () {
      const { exit, states, record } = yield* run({}, { queued: [A, B] })

      expect(exit).toStrictEqual(Exit.void)
      expect(states).toStrictEqual(["translated", "translated", undefined])
      expect([...record.written.keys()]).toStrictEqual([`${A}/a`, `${B}/a`])
      expect(record.publishes).toBe(1)
      expect(record.outputs).toStrictEqual({ publish: "true", more: "false" })
    })
  )

  it.effect("列が空なら、何も訳さずに終わる", () =>
    Effect.gen(function* () {
      const { exit, record } = yield* run({}, {})

      expect(exit).toStrictEqual(Exit.void)
      expect(record.calls).toStrictEqual([])
      expect(record.outputs).toStrictEqual({ publish: "false", more: "false" })
    })
  )

  it.effect("1回の実行で訳すのは5ページまで。残っていれば、次の実行が要ることを伝える", () =>
    Effect.gen(function* () {
      const pages = Array.from({ length: 7 }, (_, index) => `code.visualstudio.com/docs/p${index}`)
      const many = Object.fromEntries(
        pages.map((page) => [`${VSCODE}:${page.replace("code.visualstudio.com/", "")}.md`, "Some page text.\n"])
      )
      const { record, queuedLeft } = yield* run({ files: many }, { queued: pages })

      expect(record.written.size).toBe(5)
      expect(queuedLeft).toBe(2)
      expect(record.outputs).toStrictEqual({ publish: "true", more: "true" })
    })
  )

  it.effect("原文が無いページは失敗にし、ほかのページは訳す", () =>
    Effect.gen(function* () {
      const { states, record } = yield* run({}, { queued: [MISSING, A] })

      expect(states).toStrictEqual(["translated", undefined, "failed"])
      expect(record.outputs).toStrictEqual({ publish: "true", more: "false" })
    })
  )

  it.effect("障害で訳せなかったページは列に戻し、次の実行は1時間ごとの起動に任せる", () =>
    Effect.gen(function* () {
      const down = (spec: string) => Effect.fail(new ModelRequestFailed({ spec, status: 503, detail: "overloaded" }))
      const { states, record } = yield* run({ translate: down }, { queued: [A] })

      expect(states[0]).toBe("queued")
      expect(record.outputs).toStrictEqual({ publish: "false", more: "false" })
    })
  )

  it.effect("1日の上限で訳せなかったら列に戻し、次の実行は起動させない", () =>
    Effect.gen(function* () {
      const quota = (spec: string) => Effect.fail(new QuotaExceeded({ spec, detail: "PerDay" }))
      const { states, record } = yield* run({ translate: quota }, { queued: [A, B] })

      expect(states.slice(0, 2)).toStrictEqual(["queued", "queued"])
      expect(record.outputs).toStrictEqual({ publish: "false", more: "false" })
    })
  )

  it.effect("モデルの出力が原因で訳せなかったページは失敗にする", () =>
    Effect.gen(function* () {
      const garbage = (_spec: string, segments: ReadonlyArray<Segment>) =>
        Effect.succeed({ translations: new Map(segments.map((segment) => [segment.id, "> 引用になる訳"])), finishReason: "STOP" })
      const { states } = yield* run({ translate: garbage }, { queued: [A] })

      expect(states[0]).toBe("failed")
    })
  )

  it.effect("想定外の欠陥で1ページが落ちても、ほかのページの結果を列に書く", () =>
    Effect.gen(function* () {
      const translate = (_spec: string, segments: ReadonlyArray<Segment>) =>
        segments.some((segment) => segment.text.includes("First"))
          ? Effect.die("bug")
          : Effect.succeed({ translations: new Map(segments.map((segment) => [segment.id, `訳${segment.text}`])), finishReason: "STOP" })
      const { exit, states } = yield* run({ translate }, { queued: [A, B] })

      expect(exit).toStrictEqual(Exit.void)
      expect(states.slice(0, 2)).toStrictEqual(["queued", "translated"])
    })
  )

  it.effect("pushできなかったら、訳せたページも列に戻し、ジョブを失敗させる", () =>
    Effect.gen(function* () {
      const { exit, states, record } = yield* run({ failPublish: true }, { queued: [A] })

      expect(failureOf(exit)).toBeInstanceOf(PublishFailed)
      expect(states[0]).toBe("queued")
      expect(record.outputs).toStrictEqual({ publish: "false", more: "false" })
    })
  )

  it.effect("制限時間を過ぎたら、残りのページは訳さずに列に戻す", () =>
    Effect.gen(function* () {
      // 1ページ目の翻訳に50分かかる。
      const slow = (_spec: string, segments: ReadonlyArray<Segment>) =>
        Effect.sleep("50 minutes").pipe(
          Effect.as({ translations: new Map(segments.map((segment) => [segment.id, `訳${segment.text}`])), finishReason: "STOP" })
        )
      const { states, record } = yield* run({ translate: slow }, { queued: [A, B] })

      expect(states.slice(0, 2)).toStrictEqual(["translated", "queued"])
      expect(record.calls).toHaveLength(1)
      expect(record.outputs).toStrictEqual({ publish: "true", more: "true" })
    })
  )
})

describe("runJob: 手で指定したページを訳す", () => {
  it.effect("指定したページを訳し、列には触らない", () =>
    Effect.gen(function* () {
      const { exit, states, record, queuedLeft } = yield* run({}, { queued: [B], urls: [`https://${A}`] })

      expect(exit).toStrictEqual(Exit.void)
      expect([...record.written.keys()]).toStrictEqual([`${A}/a`])
      expect(states).toStrictEqual([undefined, "queued", undefined])
      expect(queuedLeft).toBe(1)
      expect(record.outputs).toStrictEqual({ publish: "true", more: "false" })
    })
  )

  it.effect("対象外のURLは訳さずに続ける", () =>
    Effect.gen(function* () {
      const { exit, record } = yield* run({}, { urls: ["https://example.com/x", A] })

      expect(exit).toStrictEqual(Exit.void)
      expect([...record.written.keys()]).toStrictEqual([`${A}/a`])
    })
  )
})
