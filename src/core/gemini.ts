/**
 * Geminiへの要求の組み立てと、応答の解釈。
 *
 * モデルには、訳す断片と共通の指示、目印の対応表だけを送る。返答の形はAPIの構造化出力で強制し、
 * 受け取った後にSchemaでも確かめる。
 */
import { Option, Schema } from "effect"
import { parseSpec } from "./model.ts"
import type { Segment } from "./segment.ts"

export const INSTRUCTIONS = `\
You translate English software documentation into Japanese.

The input is a JSON object with "segments", an ordered list of text fragments from one Markdown page. Read them all as one document for context, and translate each fragment.

Return a JSON object with "translations": one entry per input segment, in the same order, with the same "id".

Each fragment may contain:
- Placeholders of the form ⟦K7QM⟧. They stand for code, URLs, product names, and template tags. Copy each one exactly, as many times as it appears in that fragment. The four characters are an arbitrary ID with no meaning.
- When the input has "placeholders", it maps each placeholder ID to the content it stands for. Use it only to understand the sentence, for example to choose the right Japanese particle. Never copy those values into the output; write the placeholder instead.
- Markdown inline syntax: **bold**, _italic_, [link text](⟦K7QM⟧), and inline HTML tags. Keep the syntax and translate the text inside it, including link text that is the title of another page. Keep the HTML tags unchanged.

Style:
- Use polite form (です・ます調). For steps, end sentences with 〜します. Use 〜してください only for warnings or required actions.
- Keep product names, feature names, and UI labels in English as they appear in the source.
- Keep the words "pull request" and "issue" in English.
- A fragment that is only a name or a code-like term may stay as it is.
`

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models"
const MAX_OUTPUT_TOKENS = 65_536

// 項目の数は指定しない。大きな数を指定すると400で拒否されることがあるため。数は受け取った後に検査する。
const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    translations: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: { id: { type: "INTEGER" }, text: { type: "STRING" } },
        required: ["id", "text"],
        propertyOrdering: ["id", "text"]
      }
    }
  },
  required: ["translations"]
} as const

/** Geminiへ送るHTTPの要求。APIキーは含まない。 */
export interface GeminiRequest {
  readonly url: string
  readonly body: string
}

/** 断片と対応表から、Geminiへの要求を組み立てる。 */
export const geminiRequest = (spec: string, segments: ReadonlyArray<Segment>, legend: Readonly<Record<string, string>>): GeminiRequest => {
  const { model, level } = parseSpec(spec)
  const input = Object.keys(legend).length === 0 ? { segments } : { placeholders: legend, segments }
  return {
    url: `${ENDPOINT}/${model}:generateContent`,
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: INSTRUCTIONS }] },
      contents: [{ role: "user", parts: [{ text: JSON.stringify(input) }] }],
      generationConfig: {
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        ...(level === undefined ? {} : { thinkingConfig: { thinkingLevel: level } })
      }
    })
  }
}

/** モデルが返した訳。 */
export interface ModelOutput {
  /** 断片の番号と、その訳。 */
  readonly translations: ReadonlyMap<number, string>
  /** 生成が止まった理由。出力の上限で切れたときに`STOP`以外になる。 */
  readonly finishReason: string | undefined
}

const Response = Schema.Struct({
  candidates: Schema.optional(
    Schema.Array(
      Schema.Struct({
        content: Schema.optional(
          Schema.Struct({
            parts: Schema.optional(
              Schema.Array(Schema.Struct({ text: Schema.optional(Schema.String), thought: Schema.optional(Schema.Boolean) }))
            )
          })
        ),
        finishReason: Schema.optional(Schema.String)
      })
    )
  )
})

// 項目ごとに確かめる。形の合わない項目が1つあっても、ほかの項目の訳は使う。
const Translations = Schema.fromJsonString(Schema.Struct({ translations: Schema.optional(Schema.Array(Schema.Unknown)) }))
const Translation = Schema.Struct({ id: Schema.Finite, text: Schema.String })

const decodeResponse = Schema.decodeUnknownOption(Schema.fromJsonString(Response))
const decodeTranslations = Schema.decodeUnknownOption(Translations)
const decodeTranslation = Schema.decodeUnknownOption(Translation)

/**
 * Geminiの応答の本文から、訳を取り出す。
 *
 * 壊れたJSONや形の合わない応答は、すべての断片が落ちたものとして扱う(訳が空になる)。
 */
export const parseGeminiResponse = (body: string): ModelOutput => {
  const candidate = Option.getOrUndefined(decodeResponse(body))?.candidates?.[0]
  // 推論の過程(thought)は訳ではないので除く。
  const text = (candidate?.content?.parts ?? [])
    .filter((part) => part.thought !== true)
    .map((part) => part.text ?? "")
    .join("")
  const items = Option.getOrUndefined(decodeTranslations(text))?.translations ?? []
  const translations = new Map(
    items.flatMap((item) => Option.toArray(decodeTranslation(item))).map(({ id, text: translated }) => [id, translated])
  )
  return { translations, finishReason: candidate?.finishReason }
}

/** Geminiが要求を拒んだときに、次にどうするか。 */
export type GeminiFailure =
  /** その日の無料枠を使い切った。日付が変わるまで呼ばない。 */
  | { readonly kind: "quota" }
  /** 少し待てば通る見込みがある。`delaySeconds`はGeminiが指定した待ち時間。 */
  | { readonly kind: "retry"; readonly delaySeconds: number | undefined }
  /** 待っても通らない。 */
  | { readonly kind: "fatal" }

const RETRYABLE_STATUS: ReadonlySet<number> = new Set([429, 500, 503])
const TOO_MANY_REQUESTS = 429

/** HTTPの状態コードと応答の本文から、失敗の種類を決める。 */
export const classifyGeminiFailure = (status: number, body: string): GeminiFailure => {
  if (status === TOO_MANY_REQUESTS && /PerDay/i.test(body)) {
    return { kind: "quota" }
  }
  if (!RETRYABLE_STATUS.has(status)) {
    return { kind: "fatal" }
  }
  const delay = /"retryDelay":\s*"(\d+)s"/.exec(body)?.[1]
  return { kind: "retry", delaySeconds: delay === undefined ? undefined : Number(delay) }
}
