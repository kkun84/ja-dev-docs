/**
 * 訳文の記録。訳文と同じ名前の`.json`に書き、サイトのビルドで読む。
 *
 * 訳文がどの版の原文から、どのモデルで作られたかを残す。公開リポジトリに残るので、APIの応答の本文は入れない。
 */
import { Schema } from "effect"
import { mostCommon, parseSpec } from "./model.ts"

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

const TranslationRecordSchema = Schema.Struct({
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

/** 訳文1つの記録。 */
export type TranslationRecord = typeof TranslationRecordSchema.Type

/** 記録のJSONを読む。 */
export const decodeRecord = Schema.decodeUnknownEffect(Schema.fromJsonString(TranslationRecordSchema))

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

/** いちばん多くの断片を訳したモデル。1つも訳せていなければ、最初に使う指定のモデル。 */
export const primaryModel = (usedModel: ReadonlyMap<number, string>, chain: ReadonlyArray<string>): string =>
  mostCommon([...usedModel.values()]) ?? parseSpec(chain[0] ?? "").model

/** 訳文と記録を置く場所。拡張子は付けない。`<ホスト>/<パス>/<モデル>`。 */
export const translationPath = (host: string, path: string, model: string): string => `${host}/${path === "" ? "index" : path}/${model}`

// 未訳の断片がこの割合を超えたページは公開しない。
const MAX_UNTRANSLATED_RATIO = 0.05

/** ページを公開できない理由。`retry`は、時間をおけば訳せる見込みがあること。 */
export interface Unpublishable {
  readonly reason: string
  readonly retry: boolean
}

/**
 * 訳せなかった断片が多いページを公開しないための判定。公開してよければ`undefined`。
 *
 * APIの障害やその日の上限で全部が落ちたページを、英語のまま「翻訳済み」にしないため。
 */
export const unpublishable = (steps: ReadonlyArray<StepLog>, untranslated: number, segments: number): Unpublishable | undefined => {
  if (untranslated / Math.max(segments, 1) <= MAX_UNTRANSLATED_RATIO) {
    return undefined
  }
  const quota = steps.some((step) => step.error === "quota")
  return {
    reason: quota ? "quota" : `${untranslated} of ${segments} segments untranslated`,
    retry: steps.some((step) => step.error !== undefined)
  }
}

/** 手順ごとに、送った数、落ちた数、落ちた理由の内訳を1行にする。ログで原因が分かるようにする。 */
export const describeStep = (step: StepLog): string => {
  const reasons: Record<string, number> = {}
  for (const error of step.failed.flatMap((failed) => failed.errors)) {
    reasons[error] = (reasons[error] ?? 0) + 1
  }
  return `${step.spec}: sent ${step.sent}, failed ${step.failed.length}, ${step.seconds}s, ${step.error ?? "ok"}, ${JSON.stringify(reasons)}`
}
