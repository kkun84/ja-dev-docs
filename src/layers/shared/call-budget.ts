import { Effect, Layer, Ref } from "effect"
import { dailyLimit } from "../../core/model.ts"
import { QueueUnavailable } from "../../services/errors.ts"
import { CallBudget, RequestQueue } from "../../services/ports.ts"

/**
 * 翻訳モデルの1日の呼び出し回数を、順番待ちの列と同じD1に数える。
 *
 * Googleの上限の応答だけに頼ると、APIキーのプロジェクトに課金を設定したときに、上限を超えて有料で訳し続けてしまうため。
 * D1にまだ表が無い(初回のデプロイ前)など、数えられないときは、警告を1回出し、Googleの上限の応答だけに頼って続ける。
 */
export const countedCallBudgetLayer: Layer.Layer<CallBudget, never, RequestQueue> = Layer.effect(
  CallBudget,
  Effect.gen(function* () {
    const queue = yield* RequestQueue
    const unavailable = yield* Ref.make(false)
    const giveUp = (error: QueueUnavailable) =>
      Effect.logWarning(`usage counter unavailable: ${error.detail}`).pipe(Effect.andThen(Ref.set(unavailable, true)), Effect.as(true))
    return {
      reserve: (model) =>
        Ref.get(unavailable).pipe(
          Effect.flatMap((skip) => (skip ? Effect.succeed(true) : queue.reserveCall(model, dailyLimit(model)).pipe(Effect.catch(giveUp))))
        )
    }
  })
)

/** 回数を数えない枠。手元での試訳に使う。無料枠の上限は、Googleの応答だけで判断する。 */
export const uncountedCallBudgetLayer: Layer.Layer<CallBudget> = Layer.succeed(CallBudget, { reserve: () => Effect.succeed(true) })

const unavailable = Effect.fail(new QueueUnavailable({ detail: "the queue is not configured" }))

/** 列を使えない環境(Cloudflareの認証が無い)で渡す列。使おうとすると失敗する。 */
export const unavailableRequestQueueLayer: Layer.Layer<RequestQueue> = Layer.succeed(RequestQueue, {
  add: () => unavailable,
  status: () => unavailable,
  takeNext: () => unavailable,
  finish: () => unavailable,
  reserveCall: () => unavailable,
  markPublished: unavailable,
  countQueued: unavailable
})
