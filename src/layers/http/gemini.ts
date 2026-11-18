import { Effect, Layer } from "effect"
import { classifyGeminiFailure, geminiRequest, parseGeminiResponse, type ModelOutput } from "../../core/gemini.ts"
import { ModelRequestFailed, QuotaExceeded } from "../../services/errors.ts"
import { Translator } from "../../services/ports.ts"
import { withTimeout, type Fetch } from "./fetch.ts"

// 推論の長いモデルは、応答が返るまでに5分を超えることがある。
const TIMEOUT_MILLIS = 600_000
const MAX_ATTEMPTS = 4
// Geminiが待ち時間を指定しなかったときに待つ秒数。やり直すたびに延ばす。
const BACKOFF_SECONDS = 30
const MAX_DETAIL_LENGTH = 1000

export interface GeminiOptions {
  readonly apiKey: string
  readonly fetch: Fetch
}

/** Geminiを翻訳モデルとして使う。1分の上限と一時的な障害は、待ってやり直す。 */
export const geminiTranslatorLayer = (options: GeminiOptions): Layer.Layer<Translator> => {
  const send = (spec: string, url: string, body: string) =>
    Effect.tryPromise({
      try: async () => {
        const init = { method: "POST", headers: { "content-type": "application/json", "x-goog-api-key": options.apiKey }, body }
        const response = await options.fetch(url, withTimeout(init, TIMEOUT_MILLIS))
        return { status: response.status, ok: response.ok, text: await response.text() }
      },
      catch: (error) => new ModelRequestFailed({ spec, status: undefined, detail: String(error) })
    })

  const attempt = (
    spec: string,
    url: string,
    body: string,
    tried: number
  ): Effect.Effect<ModelOutput, QuotaExceeded | ModelRequestFailed> =>
    send(spec, url, body).pipe(
      Effect.flatMap(({ status, ok, text }) => {
        if (ok) {
          return Effect.succeed(parseGeminiResponse(text))
        }
        const detail = `HTTP ${status}: ${text.slice(0, MAX_DETAIL_LENGTH)}`
        const failure = classifyGeminiFailure(status, text)
        if (failure.kind === "quota") {
          return Effect.fail(new QuotaExceeded({ spec, detail }))
        }
        if (failure.kind === "fatal" || tried + 1 >= MAX_ATTEMPTS) {
          return Effect.fail(new ModelRequestFailed({ spec, status, detail }))
        }
        const seconds = failure.delaySeconds === undefined ? BACKOFF_SECONDS * (tried + 1) : failure.delaySeconds + 1
        return Effect.sleep(`${seconds} seconds`).pipe(Effect.andThen(attempt(spec, url, body, tried + 1)))
      })
    )

  return Layer.succeed(Translator, {
    translate: (spec, segments, legend) => {
      const { url, body } = geminiRequest(spec, segments, legend)
      return attempt(spec, url, body, 0)
    }
  })
}
