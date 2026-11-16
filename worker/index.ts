// Cloudflare Workerの本体。訳があるページは静的ファイルとして先に配信されるので、ここに来るのはそれ以外のURLだけ。
//
// - 原文のURLの書き方の揺れ(https:// 付き、URLエンコード)を、正規の形へリダイレクトする。
// - 訳がまだ無いページでは、翻訳をリクエストする画面を返す。
// - /api/request: Turnstileで確かめてから、D1の順番待ちの列に入れ、翻訳のワークフローを起動する。
// - /api/status: リクエストしたページの状態を返す。
//
// 訳文やサイトの部品は読み込まない。Workerを小さく保ち、ページが増えてもデプロイの上限に届かないようにする。

import { parsePageUrl, fetchPage } from "../pipeline/sources.ts";
import { addRequest, getStatus, type D1Like } from "../src/lib/queue.ts";
import { untranslatedPage } from "./page.ts";

export interface Env {
  DB: D1Like;
  ASSETS: { fetch(req: Request | string): Promise<Response> };
  REQUEST_LIMITER?: { limit(opts: { key: string }): Promise<{ success: boolean }> };
  TURNSTILE_SITE_KEY: string;
  TURNSTILE_SECRET?: string;
  GITHUB_REPO: string;
  GITHUB_WORKFLOW: string;
  GITHUB_REF: string;
  GITHUB_DISPATCH_TOKEN?: string;
}

export const SECURITY_HEADERS: Record<string, string> = {
  "content-security-policy":
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; " +
    "img-src 'self' https: data:; media-src 'self' https:; style-src 'self' 'unsafe-inline'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'",
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    try {
      if (url.pathname === "/api/request" && request.method === "POST") return await requestTranslation(request, env);
      if (url.pathname === "/api/status" && request.method === "GET") return await status(url, env);
      if (url.pathname.startsWith("/api/")) return json({ error: "not found" }, 404);
      return await page(url, env);
    } catch (e) {
      console.error(e);
      return json({ error: "一時的に処理できませんでした。時間をおいてお試しください" }, 500);
    }
  },
};

async function page(url: URL, env: Env): Promise<Response> {
  const raw = url.pathname.slice(1).replace(/^(https?):\/(?!\/)/, "$1://");
  const ref = parsePageUrl(raw);
  if (!ref) return notFound();
  const id = pageId(ref.source.host, ref.path);
  if (url.pathname !== `/${id}`) {
    // 正規の形(https:// なし)以外で来たら、正規の形へ移す。訳があれば静的ファイルが返る。
    return new Response(null, { status: 301, headers: { location: `/${id}` } });
  }
  return new Response(untranslatedPage(id, env.TURNSTILE_SITE_KEY), {
    headers: { "content-type": "text/html; charset=utf-8", "x-robots-tag": "noindex", "cache-control": "no-store", ...SECURITY_HEADERS },
  });
}

async function requestTranslation(request: Request, env: Env): Promise<Response> {
  const ip = request.headers.get("cf-connecting-ip") ?? "";
  if (env.REQUEST_LIMITER && !(await env.REQUEST_LIMITER.limit({ key: ip })).success) return json({ error: "リクエストが多すぎます。少し時間をおいてお試しください" }, 429);

  const body = (await request.json().catch(() => ({}))) as { page?: string; token?: string };
  const ref = body.page ? parsePageUrl(body.page) : undefined;
  if (!ref) return json({ error: "対象外のURLです" }, 400);
  const id = pageId(ref.source.host, ref.path);

  if (!env.TURNSTILE_SECRET) return json({ error: "受付の準備ができていません" }, 503);
  const verify = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: body.token ?? "", remoteip: ip }),
  });
  if (!((await verify.json()) as { success?: boolean }).success) return json({ error: "確認に失敗しました。もう一度お試しください" }, 403);

  if (await isPublished(env, id, request.url)) return json({ state: "done", published: true });
  // 原文のリポジトリに無いページ(打ち間違いなど)は列に入れない。
  if (!(await getStatus(env.DB, id)) && !(await fetchPage(ref))) return json({ error: "原文のページが見つかりません" }, 404);
  if (!(await addRequest(env.DB, id))) return json({ error: "今日の受付の上限に達しました。明日もう一度お試しください" }, 429);
  await dispatch(env);
  return json({ ...publicStatus(await getStatus(env.DB, id)), published: false });
}

async function status(url: URL, env: Env): Promise<Response> {
  const ref = parsePageUrl(url.searchParams.get("page") ?? "");
  if (!ref) return json({ error: "対象外のURLです" }, 400);
  const id = pageId(ref.source.host, ref.path);
  return json({ ...publicStatus(await getStatus(env.DB, id)), published: await isPublished(env, id, url.toString()) });
}

// 状態だけを返す。失敗の理由などの内部の情報は返さない。
function publicStatus(row: Awaited<ReturnType<typeof getStatus>>) {
  return row ? { state: row.state, position: row.position } : {};
}

async function isPublished(env: Env, id: string, base: string): Promise<boolean> {
  const res = await env.ASSETS.fetch(new URL(`/${id}/`, base).toString());
  return res.ok;
}

// 翻訳のワークフローを起動する。実行中なら、Actionsの concurrency で終わるのを待ってから始まる。
async function dispatch(env: Env) {
  if (!env.GITHUB_DISPATCH_TOKEN) return;
  await fetch(`https://api.github.com/repos/${env.GITHUB_REPO}/actions/workflows/${env.GITHUB_WORKFLOW}/dispatches`, {
    method: "POST",
    headers: { authorization: `Bearer ${env.GITHUB_DISPATCH_TOKEN}`, accept: "application/vnd.github+json", "user-agent": "ja-dev-docs" },
    body: JSON.stringify({ ref: env.GITHUB_REF }),
  });
}

function pageId(host: string, path: string) {
  return path ? `${host}/${path}` : host;
}

function notFound(): Response {
  return new Response("Not found", { status: 404, headers: { "content-type": "text/plain; charset=utf-8", ...SECURITY_HEADERS } });
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...SECURITY_HEADERS } });
}
