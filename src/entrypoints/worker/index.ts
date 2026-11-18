// Cloudflare Workerの入口。訳があるページは静的ファイルとして先に配信されるので、ここに来るのはそれ以外のURLだけ。
//
// - 原文のURLの書き方の揺れ(https://付き、URLエンコード)を、正規の形へリダイレクトする。
// - 訳がまだ無いページでは、翻訳をリクエストする画面を返す。
// - /api/request: bot判定で確かめてから、順番待ちの列に入れ、翻訳のワークフローを起動する。
// - /api/status: リクエストしたページの状態を返す。
//
// 訳文やサイトの部品、Markdownの解析は読み込まない。Workerを小さく保ち、ページが増えてもデプロイの上限に届かないようにする。
import { Effect, Option, Schema } from "effect"
import type { Env } from "../../layers/cloudflare/bindings.ts"
import type { Fetch } from "../../layers/http/fetch.ts"
import { describeCause } from "../../services/errors.ts"
import { requestStatus, requestTranslation, resolvePage } from "../../services/request.ts"
import { layerFor } from "./layer.ts"
import { apiNotFound, json, notFound, redirect, rejection, requestPage, unexpected } from "./response.ts"

// リクエストの本文。読者のブラウザから来るので、形を確かめてから使う。
const RequestBody = Schema.Struct({ page: Schema.optional(Schema.String), token: Schema.optional(Schema.String) })
const decodeBody = Schema.decodeUnknownOption(RequestBody)

const handleRequest = Effect.fn("handleRequest")(function* (request: Request) {
  // JSONとして読めない本文は、空の本文として扱う。対象外のURLとして断る。
  const raw: unknown = yield* Effect.tryPromise(() => request.json()).pipe(Effect.orElseSucceed(() => ({})))
  const body = Option.getOrElse(decodeBody(raw), () => ({ page: undefined, token: undefined }))
  const reply = yield* requestTranslation({
    page: body.page ?? "",
    token: body.token ?? "",
    ip: request.headers.get("cf-connecting-ip") ?? ""
  })
  return reply.kind === "accepted" ? json(reply.reply) : rejection(reply.reason)
})

const handleStatus = Effect.fn("handleStatus")(function* (url: URL) {
  const reply = yield* requestStatus(url.searchParams.get("page") ?? "")
  return Option.match(reply, { onNone: () => rejection("unsupported"), onSome: (status) => json(status) })
})

const handlePage = (url: URL, env: Env): Response => {
  const reply = resolvePage(url.pathname)
  if (reply.kind === "redirect") {
    return redirect(reply.location)
  }
  return reply.kind === "untranslated" ? requestPage(reply.page, env.TURNSTILE_SITE_KEY) : notFound()
}

const route = (request: Request, env: Env) => {
  const url = new URL(request.url)
  if (url.pathname === "/api/request" && request.method === "POST") {
    return handleRequest(request)
  }
  if (url.pathname === "/api/status" && request.method === "GET") {
    return handleStatus(url)
  }
  return Effect.succeed(url.pathname.startsWith("/api/") ? apiNotFound() : handlePage(url, env))
}

/** Workerを作る。`fetch`は、原文のリポジトリ、bot判定、ワークフローの起動に使う。 */
export const createWorker = (fetch: Fetch) => ({
  fetch: (request: Request, env: Env): Promise<Response> =>
    Effect.runPromise(
      route(request, env).pipe(
        Effect.provide(layerFor(request, env, fetch)),
        // 型付きのエラー(D1の障害など)も想定外の欠陥も、詳細はログにだけ残し、一般的な文言で答える。
        Effect.catchCause((cause) => Effect.logError("request failed", describeCause(cause)).pipe(Effect.as(unexpected())))
      )
    )
})

export default createWorker(fetch)
