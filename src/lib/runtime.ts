// Workerの環境変数とバインディング。
import { env as cfEnv } from "cloudflare:workers";
import type { D1Like } from "./queue.ts";

export interface Env {
  DB: D1Like;
  ASSETS: { fetch(req: Request | string): Promise<Response> };
  TURNSTILE_SITE_KEY: string;
  TURNSTILE_SECRET: string;
  GITHUB_REPO: string;
  GITHUB_WORKFLOW: string;
  GITHUB_REF: string;
  GITHUB_DISPATCH_TOKEN?: string;
  QUEUE_SECRET?: string;
}

export const env = cfEnv as unknown as Env;

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
}

// 訳のページが静的ファイルとして公開済みか。
export async function isPublished(page: string, base: string): Promise<boolean> {
  const res = await env.ASSETS.fetch(new URL(`/${page}/`, base).toString());
  return res.ok;
}

// 共有の秘密を、比較時間で漏らさないように比べる。
export function authorized(request: Request): boolean {
  const secret = env.QUEUE_SECRET;
  const given = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!secret || given.length !== secret.length) return false;
  let diff = 0;
  for (let i = 0; i < secret.length; i++) diff |= secret.charCodeAt(i) ^ given.charCodeAt(i);
  return diff === 0;
}
