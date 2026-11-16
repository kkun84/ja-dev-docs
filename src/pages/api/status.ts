// リクエストしたページの状態。公開済みになったら、ブラウザが訳のページへ移る。
import type { APIRoute } from "astro";
import { getStatus } from "../../lib/queue.ts";
import { env, json, isPublished } from "../../lib/runtime.ts";

export const prerender = false;

export const GET: APIRoute = async ({ url, request }) => {
  const page = url.searchParams.get("page") ?? "";
  if (!page) return json({ error: "page is required" }, 400);
  const published = await isPublished(page, request.url);
  return json({ ...(await getStatus(env.DB, page)), published });
};
