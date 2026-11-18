import { Effect, Layer } from "effect"
import { PublishedPages, RateLimiter } from "../../services/ports.ts"
import type { AssetsBinding, RateLimitBinding } from "./bindings.ts"

/**
 * 公開済みのページを、静的アセットにあるかどうかで判定する。
 *
 * `origin`は、いま処理している要求のオリジン。アセットのバインディングは絶対URLを要る。
 */
export const publishedPagesLayer = (assets: AssetsBinding, origin: string): Layer.Layer<PublishedPages> =>
  Layer.succeed(PublishedPages, {
    has: (page) =>
      Effect.tryPromise(async () => {
        const response = await assets.fetch(new URL(`/${page}/`, origin).toString())
        return response.ok
      }).pipe(Effect.orElseSucceed(() => false))
  })

/** Cloudflareのレート制限。バインディングが無い環境(ローカルの実行)では制限しない。 */
export const rateLimiterLayer = (limiter?: RateLimitBinding): Layer.Layer<RateLimiter> =>
  Layer.succeed(RateLimiter, {
    allow: (key) =>
      limiter === undefined
        ? Effect.succeed(true)
        : Effect.tryPromise(async () => {
            const { success } = await limiter.limit({ key })
            return success
          }).pipe(Effect.orElseSucceed(() => true))
  })
