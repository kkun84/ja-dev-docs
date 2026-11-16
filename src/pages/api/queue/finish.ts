// GitHub Actionsが、訳して公開し終えたページを知らせる。
import type { APIRoute } from "astro";
import { finish } from "../../../lib/queue.ts";
import { env, json, authorized } from "../../../lib/runtime.ts";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (!authorized(request)) return json({ error: "unauthorized" }, 401);
  const { results } = (await request.json()) as { results: { page: string; ok: boolean; retry?: boolean; error?: string }[] };
  for (const r of results ?? []) await finish(env.DB, r.page, r.ok, r.error, r.retry);
  return json({ ok: true });
};
