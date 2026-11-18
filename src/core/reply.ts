/**
 * 翻訳リクエストのAPIが、読者に返す答え。
 */
import type { RequestStatus } from "./queue.ts"

/** リクエストを受け付けなかった理由。 */
export type Rejection = "rate-limited" | "unsupported" | "not-ready" | "bot-check-failed" | "source-not-found" | "daily-limit"

/** 理由ごとの、HTTPの状態コードと、読者に見せる文言。 */
export const REJECTIONS: Readonly<Record<Rejection, { readonly status: number; readonly message: string }>> = {
  "rate-limited": { status: 429, message: "リクエストが多すぎます。少し時間をおいてお試しください" },
  unsupported: { status: 400, message: "対象外のURLです" },
  "not-ready": { status: 503, message: "受付の準備ができていません" },
  "bot-check-failed": { status: 403, message: "確認に失敗しました。もう一度お試しください" },
  "source-not-found": { status: 404, message: "原文のページが見つかりません" },
  "daily-limit": { status: 429, message: "今日の受付の上限に達しました。明日もう一度お試しください" }
}

/** 想定外の失敗のときに、読者に見せる文言。内部の情報は出さない。 */
export const UNEXPECTED_MESSAGE = "一時的に処理できませんでした。時間をおいてお試しください"

/** ページの状況の答え。`published`は、日本語訳を静的ファイルとして配信しているか。 */
export interface StatusReply {
  readonly state?: RequestStatus["state"]
  readonly position?: number
  readonly published: boolean
}

/** 列の行の状況から、答えを作る。失敗の理由などの内部の情報は含めない。リクエストされたことが無ければ、状況は付けない。 */
export const statusReply = (status: RequestStatus | undefined, published: boolean): StatusReply =>
  status === undefined ? { published } : { state: status.state, position: status.position, published }

/** 訳がもう公開されているページへのリクエストの答え。 */
export const PUBLISHED_REPLY: StatusReply = { state: "done", published: true }
