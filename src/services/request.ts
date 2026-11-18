import { Effect, Option } from "effect"
import { PUBLISHED_REPLY, statusReply, type Rejection, type StatusReply } from "../core/reply.ts"
import { pageId, parsePageUrl, parseSitePath, type PageRef } from "../core/source.ts"
import { BotCheck, PublishedPages, RateLimiter, RequestQueue, WorkflowDispatcher } from "./ports.ts"
import { sourceExists } from "./source.ts"

/** 翻訳リクエストの入力。読者のブラウザから来るので、どれも信用しない。 */
export interface TranslationRequest {
  /** 原文のURLか、このサイトでのページの場所。 */
  readonly page: string
  /** bot判定のトークン。 */
  readonly token: string
  /** 読者のIPアドレス。 */
  readonly ip: string
}

/** リクエストへの答え。受け付けなかったときは、その理由。 */
export type RequestReply =
  | { readonly kind: "accepted"; readonly reply: StatusReply }
  | { readonly kind: "rejected"; readonly reason: Rejection }

const idOf = (ref: PageRef): string => pageId(ref.source.host, ref.path)

const rejected = (reason: Rejection): RequestReply => ({ kind: "rejected", reason })

const currentStatus = (page: string) => RequestQueue.use((queue) => queue.status(page)).pipe(Effect.map(Option.getOrUndefined))

// 列に入れてよいページか。打ち間違いなど、原文のリポジトリに無いページは列に入れない。
// 前にリクエストされたページは、そのときに確かめてあるので、確かめ直さない。
const isKnownPage = Effect.fn("isKnownPage")(function* (ref: PageRef) {
  return (yield* currentStatus(idOf(ref))) !== undefined || (yield* sourceExists(ref))
})

const enqueue = Effect.fn("enqueue")(function* (ref: PageRef) {
  const page = idOf(ref)
  if (yield* (yield* PublishedPages).has(page)) {
    return { kind: "accepted", reply: PUBLISHED_REPLY } satisfies RequestReply
  }
  if (!(yield* isKnownPage(ref))) {
    return rejected("source-not-found")
  }
  if (!(yield* (yield* RequestQueue).add(page))) {
    return rejected("daily-limit")
  }
  // 記録と同時に、翻訳のワークフローを毎回起動する。実行中かどうかは判定しない。
  yield* (yield* WorkflowDispatcher).dispatch
  return { kind: "accepted", reply: statusReply(yield* currentStatus(page), false) } satisfies RequestReply
})

/**
 * 翻訳リクエストを受け付ける。
 *
 * 回数の制限、URLの正規化、bot判定を通ったものだけを列に入れ、翻訳のワークフローを起動する。
 */
export const requestTranslation = Effect.fn("requestTranslation")(function* (request: TranslationRequest) {
  if (!(yield* (yield* RateLimiter).allow(request.ip))) {
    return rejected("rate-limited")
  }
  const ref = parsePageUrl(request.page)
  if (ref === undefined) {
    return rejected("unsupported")
  }
  const human = yield* (yield* BotCheck).verify(request.token, request.ip).pipe(Effect.option)
  if (Option.isNone(human)) {
    return rejected("not-ready")
  }
  return human.value ? yield* enqueue(ref) : rejected("bot-check-failed")
})

/** リクエストしたページの状況。対象外のURLは`None`。 */
export const requestStatus = Effect.fn("requestStatus")(function* (page: string) {
  const ref = parsePageUrl(page)
  if (ref === undefined) {
    return Option.none<StatusReply>()
  }
  const id = idOf(ref)
  return Option.some(statusReply(yield* currentStatus(id), yield* (yield* PublishedPages).has(id)))
})

/** 訳が無いページのURLへの答え。 */
export type PageReply =
  /** 対象外のURL。 */
  | { readonly kind: "not-found" }
  /** 正規の形(`https://`なし)以外で来た。正規の形へ移す。訳があれば静的ファイルが返る。 */
  | { readonly kind: "redirect"; readonly location: string }
  /** まだ訳が無い。翻訳をリクエストする画面を返す。 */
  | { readonly kind: "untranslated"; readonly page: string }

/** このサイトのURLのパスから、どう答えるかを決める。訳があるページは静的ファイルとして先に配信されるので、ここには来ない。 */
export const resolvePage = (pathname: string): PageReply => {
  const ref = parseSitePath(pathname)
  if (ref === undefined) {
    return { kind: "not-found" }
  }
  const page = idOf(ref)
  return pathname === `/${page}` ? { kind: "untranslated", page } : { kind: "redirect", location: `/${page}` }
}
