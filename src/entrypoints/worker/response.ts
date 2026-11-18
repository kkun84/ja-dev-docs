import { SECURITY_HEADERS, untranslatedPage } from "../../core/request-page.ts"
import { REJECTIONS, UNEXPECTED_MESSAGE, type Rejection } from "../../core/reply.ts"

const OK = 200
const MOVED_PERMANENTLY = 301
const NOT_FOUND = 404
const INTERNAL_SERVER_ERROR = 500

/** JSONの答え。キャッシュさせない。 */
export const json = (body: unknown, status: number = OK): Response =>
  Response.json(body, { status, headers: { "cache-control": "no-store", ...SECURITY_HEADERS } })

/** 受け付けなかった理由を、決めた状態コードと文言で答える。 */
export const rejection = (reason: Rejection): Response => json({ error: REJECTIONS[reason].message }, REJECTIONS[reason].status)

/** 想定外の失敗。内部の情報は出さない。 */
export const unexpected = (): Response => json({ error: UNEXPECTED_MESSAGE }, INTERNAL_SERVER_ERROR)

export const apiNotFound = (): Response => json({ error: "not found" }, NOT_FOUND)

export const notFound = (): Response =>
  new Response("Not found", { status: NOT_FOUND, headers: { "content-type": "text/plain; charset=utf-8", ...SECURITY_HEADERS } })

export const redirect = (location: string): Response => new Response(null, { status: MOVED_PERMANENTLY, headers: { location } })

/** 翻訳をリクエストする画面。検索エンジンには載せない。 */
export const requestPage = (page: string, siteKey: string): Response =>
  new Response(untranslatedPage(page, siteKey), {
    headers: { "content-type": "text/html; charset=utf-8", "x-robots-tag": "noindex", "cache-control": "no-store", ...SECURITY_HEADERS }
  })
