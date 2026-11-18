/**
 * 翻訳リクエストの順番待ちの列の決まり。
 *
 * 列はD1に置く。ここには、行の形、状態の移り方、上限の値だけを書く。SQLは`layers`にある。
 */
import { Schema } from "effect"

/**
 * - `queued`: 順番待ち
 * - `translating`: 翻訳中
 * - `translated`: 訳してコミット済みで、公開(デプロイ)待ち
 * - `done`: 公開済み
 * - `failed`: 失敗。もう一度リクエストすると列に戻る
 */
const RequestState = Schema.Literals(["queued", "translating", "translated", "done", "failed"])

type RequestState = typeof RequestState.Type

/** 列の1行。同じページへのリクエストは1行にまとめ、件数を数える。 */
export const RequestRow = Schema.Struct({
  page: Schema.String,
  count: Schema.Finite,
  state: RequestState,
  first_requested_at: Schema.String,
  updated_at: Schema.String,
  error: Schema.NullOr(Schema.String)
})

/** 読者に見せる、リクエストの状況。失敗の理由などの内部の情報は含めない。 */
export interface RequestStatus {
  readonly state: RequestState
  /** 順番待ちの何番目か。順番待ちでなければ0。 */
  readonly position: number
}

/** 訳し終えた後の、列の行の行き先。 */
export type Outcome =
  /** 訳してコミットした。公開待ちにする。 */
  | { readonly kind: "translated" }
  /** 無料枠の上限や障害で訳せなかった。時間をおけば訳せる見込みがあるので、列に戻す。 */
  | { readonly kind: "requeue"; readonly reason: string }
  /** 訳せなかった。もう一度リクエストされるまで訳さない。 */
  | { readonly kind: "failed"; readonly reason: string }

const OUTCOME_STATES = { translated: "translated", requeue: "queued", failed: "failed" } as const satisfies Record<
  Outcome["kind"],
  RequestState
>
const MAX_ERROR_LENGTH = 500

/** 結果から、行の次の状態と、残す理由を決める。 */
export const afterOutcome = (outcome: Outcome): { readonly state: RequestState; readonly error: string | null } => ({
  state: OUTCOME_STATES[outcome.kind],
  error: outcome.kind === "translated" ? null : outcome.reason.slice(0, MAX_ERROR_LENGTH)
})

/** 実行が途中で止まった「翻訳中」を、もう一度列に戻すまでの時間(分)。 */
const STALE_MINUTES = 120

/** 1日に受け付ける新しいページの数。Turnstileを通せる相手でも、無料枠と訳文の量を際限なく増やせないようにする。 */
export const DAILY_NEW_PAGES = 200

const MILLIS_PER_MINUTE = 60_000

/** この時刻より前に「翻訳中」になったまま動いていない行は、止まったものとして列に戻す。 */
export const staleBefore = (nowMillis: number): string => new Date(nowMillis - STALE_MINUTES * MILLIS_PER_MINUTE).toISOString()

/** 時刻をISO 8601の文字列にする。列の行の時刻はこの形で持つ。 */
export const isoTime = (millis: number): string => new Date(millis).toISOString()

/** 時刻の、UTCでの日付。その日に受け付けた新しいページを数えるのに使う。 */
export const utcDate = (millis: number): string => isoTime(millis).slice(0, 10)

const pacific = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit" })

/** 時刻の、太平洋時間での日付。Geminiの無料枠は太平洋時間の0時に戻る。 */
export const pacificDate = (millis: number): string => pacific.format(new Date(millis))
