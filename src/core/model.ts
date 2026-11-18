/**
 * 翻訳に使うモデルの決まり。
 *
 * モデルの指定は`gemini-3.8-flash@low`の形で、`@`の後ろは推論の量。
 */

/** 訳す順。検査に落ちた断片だけを、次の指定のモデルへ回す。 */
export const DEFAULT_CHAIN: ReadonlyArray<string> = ["gemini-3.5-flash-lite", "gemini-3.5-flash-lite", "gemini-3.8-flash@low"]

/** 1日に呼んでよい回数。無料枠(Flash-Lite 500回、3.8 Flash 20回)より少し少なくし、手での試訳の分を残す。 */
const DAILY_LIMITS: ReadonlyMap<string, number> = new Map([
  ["gemini-3.5-flash-lite", 450],
  ["gemini-3.8-flash", 18]
])

/** 既定の訳を選ぶ順。前にあるものほど優先する。 */
export const MODEL_ORDER: ReadonlyArray<string> = ["gemini-3.5-flash-lite", "gemini-3.8-flash", "plamo-3.1-prime", "plamo-3-translate-8b"]

const MODEL_LABELS: ReadonlyMap<string, string> = new Map([
  ["gemini-3.5-flash-lite", "Gemini 3.5 Flash-Lite"],
  ["gemini-3.8-flash", "Gemini 3.8 Flash"],
  ["plamo-3.1-prime", "PLaMo 3.1 Prime"],
  ["plamo-3-translate-8b", "PLaMo 3 Translate 8B"]
])

/** 読者に見せるモデルの名前。知らないモデルはIDのまま。 */
export const modelLabel = (model: string): string => MODEL_LABELS.get(model) ?? model

export interface ModelSpec {
  readonly model: string
  /** 推論の量。指定が無ければモデルの既定。 */
  readonly level: string | undefined
}

/** モデルの指定を、モデルのIDと推論の量に分ける。 */
export const parseSpec = (spec: string): ModelSpec => {
  const [model = "", level] = spec.split("@")
  return { model, level }
}

/** その日にこのモデルを呼んでよい回数。上限を決めていないモデルは呼ばない。 */
export const dailyLimit = (model: string): number => DAILY_LIMITS.get(model) ?? 0

/** いちばん多く出てくる値。同数なら先に出てきたもの。 */
export const mostCommon = (values: ReadonlyArray<string>): string | undefined => {
  const counts = new Map<string, number>()
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }
  return [...counts].toSorted((left, right) => right[1] - left[1])[0]?.[0]
}
