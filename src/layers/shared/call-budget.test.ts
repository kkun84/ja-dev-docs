import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer } from "effect"
import { QueueUnavailable } from "../../services/errors.ts"
import { CallBudget, RequestQueue } from "../../services/ports.ts"
import { requestQueueLayer } from "../d1/queue.ts"
import { memoryD1Client } from "../test/sqlite.ts"
import { countedCallBudgetLayer, unavailableRequestQueueLayer, uncountedCallBudgetLayer } from "./call-budget.ts"

const reserve = (model: string, times: number) =>
  CallBudget.use((budget) => Effect.forEach(Array.from({ length: times }), () => budget.reserve(model))).pipe(
    Effect.map((results) => results.filter(Boolean).length)
  )

describe("countedCallBudgetLayer", () => {
  it.effect("モデルごとの1日の上限まで呼べる", () =>
    Effect.gen(function* () {
      expect(yield* reserve("gemini-3.8-flash", 20)).toBe(18)
      expect(yield* reserve("gemini-3.5-flash-lite", 3)).toBe(3)
    }).pipe(Effect.provide(countedCallBudgetLayer.pipe(Layer.provide(requestQueueLayer(memoryD1Client())))))
  )

  it.effect("上限を決めていないモデルは呼ばない", () =>
    Effect.gen(function* () {
      expect(yield* reserve("unknown-model", 2)).toBe(0)
    }).pipe(Effect.provide(countedCallBudgetLayer.pipe(Layer.provide(requestQueueLayer(memoryD1Client())))))
  )

  it.effect("数えられないときは、数えるのをやめて呼ばせる", () =>
    Effect.gen(function* () {
      expect(yield* reserve("gemini-3.8-flash", 30)).toBe(30)
    }).pipe(Effect.provide(countedCallBudgetLayer.pipe(Layer.provide(unavailableRequestQueueLayer))))
  )
})

describe("uncountedCallBudgetLayer", () => {
  it.effect("何回でも呼べる", () =>
    Effect.gen(function* () {
      expect(yield* reserve("unknown-model", 30)).toBe(30)
    }).pipe(Effect.provide(uncountedCallBudgetLayer))
  )
})

describe("unavailableRequestQueueLayer", () => {
  it.effect("使おうとするとQueueUnavailableで失敗する", () =>
    Effect.gen(function* () {
      const queue = yield* RequestQueue

      expect(yield* Effect.flip(queue.takeNext(1))).toBeInstanceOf(QueueUnavailable)
      expect(yield* Effect.flip(queue.countQueued)).toBeInstanceOf(QueueUnavailable)
    }).pipe(Effect.provide(unavailableRequestQueueLayer))
  )
})
