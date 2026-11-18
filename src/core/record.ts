/**
 * 訳文の記録。訳文と同じ名前の`.json`に書き、サイトのビルドで読む。
 *
 * 訳文がどの版の原文から、どのモデルで作られたかを残す。公開リポジトリに残るので、APIの応答の本文は入れない。
 */
import { Schema } from "effect"

const StepLogSchema = Schema.Struct({
  spec: Schema.String,
  sent: Schema.Finite,
  failed: Schema.Array(Schema.Struct({ id: Schema.Finite, errors: Schema.Array(Schema.String) })),
  finishReason: Schema.optional(Schema.String),
  seconds: Schema.Finite,
  /** モデルを呼べなかった理由。`quota`か、`request: HTTP 500`の形。 */
  error: Schema.optional(Schema.String)
})

/** モデルを1回(1つの指定で)使った結果。`sent`は送った断片の数、`failed`は採らなかった断片とその理由。 */
export type StepLog = typeof StepLogSchema.Type

/** 訳文1つの記録。 */
export const TranslationRecord = Schema.Struct({
  /** 原文のURL。 */
  url: Schema.String,
  /** 原文のリポジトリ(`owner/name`)と、その中のファイル。 */
  repo: Schema.String,
  file: Schema.String,
  /** 訳した時点の、原文のブランチのコミット。取得できなかったときは無い。 */
  commit: Schema.optional(Schema.String),
  translatedAt: Schema.String,
  /** いちばん多くの断片を訳したモデル。ファイル名と帰属表示に使う。 */
  model: Schema.String,
  chain: Schema.Array(Schema.String),
  segments: Schema.Finite,
  segmentsByModel: Schema.Record(Schema.String, Schema.Finite),
  /** 訳せずに原文のまま残した断片の番号。 */
  untranslated: Schema.Array(Schema.Finite),
  /** 原文の見出し。訳文の見出しのIDを、原文と同じにするために使う。 */
  headings: Schema.Array(Schema.String),
  unresolvedLiquid: Schema.optional(Schema.Array(Schema.String)),
  steps: Schema.optional(Schema.Array(StepLogSchema))
})

export type TranslationRecord = typeof TranslationRecord.Type

/** 記録のJSONを読む。 */
export const decodeRecord = Schema.decodeUnknownEffect(Schema.fromJsonString(TranslationRecord))

/** 記録をJSONにする。キーの順は固定で、末尾に改行を付ける。 */
export const encodeRecord = (record: TranslationRecord): string => {
  const {
    url,
    repo,
    file,
    commit,
    translatedAt,
    model,
    chain,
    segments,
    segmentsByModel,
    untranslated,
    headings,
    unresolvedLiquid,
    steps
  } = record
  const ordered = {
    url,
    repo,
    file,
    commit,
    translatedAt,
    model,
    chain,
    segments,
    segmentsByModel,
    untranslated,
    headings,
    unresolvedLiquid,
    steps
  }
  return `${JSON.stringify(ordered, undefined, 2)}\n`
}

/** 断片の番号ごとのモデルから、モデルごとの断片の数を数える。 */
export const countByModel = (usedModel: ReadonlyMap<number, string>): Readonly<Record<string, number>> => {
  const counts: Record<string, number> = {}
  for (const model of usedModel.values()) {
    counts[model] = (counts[model] ?? 0) + 1
  }
  return counts
}

/** 訳文と記録を置く場所。拡張子は付けない。`<ホスト>/<パス>/<モデル>`。 */
export const translationPath = (host: string, path: string, model: string): string => `${host}/${path === "" ? "index" : path}/${model}`
