// 翻訳リクエストを受け付ける。Turnstileで人間の操作か確かめ、原文が実在するページだけを列に入れる。
import type { APIRoute } from "astro";
import { parsePageUrl, fetchPage } from "../../../pipeline/sources.ts";
import { addRequest, getStatus } from "../../lib/queue.ts";
import { env, json, isPublished } from "../../lib/runtime.ts";
import { pageId } from "../../lib/links.ts";

export const prerender = false;

export const POST: APIRoute = async (context) => {
  try {
    return await handle(context);
  } catch (e) {
    console.error(e);
    return json({ error: "一時的に受け付けられませんでした。時間をおいてお試しください" }, 502);
  }
};

const handle: APIRoute = async ({ request, clientAddress }) => {
  const body = (await request.json().catch(() => ({}))) as { page?: string; token?: string };
  const ref = body.page ? parsePageUrl(body.page) : undefined;
  if (!ref) return json({ error: "対象外のURLです" }, 400);
  const page = pageId(ref.source.host, ref.path);

  const verify = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: body.token ?? "", remoteip: clientAddress }),
  });
  if (!((await verify.json()) as { success?: boolean }).success) return json({ error: "確認に失敗しました。もう一度お試しください" }, 403);

  if (await isPublished(page, request.url)) return json({ state: "done", published: true });
  // 原文のリポジトリに無いページ(打ち間違いなど)は列に入れない。
  if (!(await getStatus(env.DB, page)) && !(await fetchPage(ref).catch(() => undefined))) return json({ error: "原文のページが見つかりません" }, 404);

  await addRequest(env.DB, page);
  await dispatch();
  return json({ ...(await getStatus(env.DB, page)), published: false });
};

// 翻訳のワークフローを起動する。実行中なら、Actionsの concurrency で終わるのを待ってから始まる。
async function dispatch() {
  if (!env.GITHUB_DISPATCH_TOKEN) return;
  await fetch(`https://api.github.com/repos/${env.GITHUB_REPO}/actions/workflows/${env.GITHUB_WORKFLOW}/dispatches`, {
    method: "POST",
    headers: { authorization: `Bearer ${env.GITHUB_DISPATCH_TOKEN}`, accept: "application/vnd.github+json", "user-agent": "ja-dev-docs" },
    body: JSON.stringify({ ref: env.GITHUB_REF }),
  });
}
