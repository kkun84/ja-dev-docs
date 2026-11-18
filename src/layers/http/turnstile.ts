import { Effect, Layer, Option, Schema } from "effect"
import { BotCheckNotConfigured } from "../../services/errors.ts"
import { BotCheck } from "../../services/ports.ts"
import type { Fetch } from "./fetch.ts"

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"
const Verdict = Schema.Struct({ success: Schema.Boolean })
const decodeVerdict = Schema.decodeUnknownOption(Verdict)

export interface TurnstileOptions {
  readonly fetch: Fetch
  /** Turnstileの秘密鍵。登録されていなければ、リクエストを受け付けない。 */
  readonly secret: string | undefined
}

/** Cloudflare Turnstileでbotでないことを確かめる。確かめられなかったときは、通さない。 */
export const turnstileLayer = (options: TurnstileOptions): Layer.Layer<BotCheck> =>
  Layer.succeed(BotCheck, {
    verify: (token, ip) => {
      const { secret } = options
      if (secret === undefined || secret === "") {
        return Effect.fail(new BotCheckNotConfigured())
      }
      return Effect.tryPromise(async () => {
        const response = await options.fetch(VERIFY_URL, {
          method: "POST",
          body: new URLSearchParams({ secret, response: token, remoteip: ip })
        })
        const body: unknown = await response.json()
        return Option.exists(decodeVerdict(body), (verdict) => verdict.success)
      }).pipe(Effect.orElseSucceed(() => false))
    }
  })
