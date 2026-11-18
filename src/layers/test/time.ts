import { Effect, Fiber } from "effect"
import { TestClock } from "effect/testing"

/**
 * 待ち時間のある手順を、テストの時計を進めながら最後まで動かす。
 *
 * テストの時計は自分では進まないので、`Effect.sleep`で待つ手順は、時計を進めないと終わらない。
 * 手順が終わるまで、`step`ずつ時計を進める。
 */
export const passTime = <A, E, R>(effect: Effect.Effect<A, E, R>, step: "1 second" | "1 minute" = "1 second"): Effect.Effect<A, E, R> =>
  Effect.gen(function* () {
    const fiber = yield* Effect.forkChild(effect)
    yield* Effect.yieldNow
    while (fiber.pollUnsafe() === undefined) {
      yield* TestClock.adjust(step)
    }
    return yield* Fiber.join(fiber)
  })
