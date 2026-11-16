// GitHub Actionsが、次に訳すページを受け取る。共有の秘密で認証する。
import type { APIRoute } from "astro";
import { takeNext } from "../../../lib/queue.ts";
import { env, json, authorized } from "../../../lib/runtime.ts";

export const prerender = false;

export const POST: APIRoute = async ({ request, url }) => {
  if (!authorized(request)) return json({ error: "unauthorized" }, 401);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 5) || 5, 20);
  return json({ pages: await takeNext(env.DB, limit) });
};
