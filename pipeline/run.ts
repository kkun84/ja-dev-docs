// GitHub Actionsで動かす翻訳の本体。
//
// 1. 訳すページを決める。入力のURLがあればそれを、無ければWorkerの順番待ちの列から受け取る。
// 2. 訳して content/ に書き、コミットしてpushする。
// 3. Cloudflareの設定があれば、サイトをビルドしてデプロイする。
// 4. Workerに結果を知らせる。訳せなかったページは、無料枠の上限のときだけ列に戻す。
// 列が空になるか、時間の上限まで繰り返す。

import { execFileSync } from "node:child_process";
import { parsePageUrl } from "./sources.ts";
import { geminiCaller } from "./model.ts";
import { DEFAULT_CHAIN, loadGlossaries, translateOne } from "./job.ts";

const env = process.env;
const apiKey = env.GEMINI_API_KEY;
if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
const opts = { chain: DEFAULT_CHAIN, call: geminiCaller(apiKey), out: "content" };
const glossaries = await loadGlossaries();
const queue = env.SITE_URL && env.QUEUE_SECRET ? { site: env.SITE_URL.replace(/\/$/, ""), secret: env.QUEUE_SECRET } : undefined;
const canDeploy = Boolean(env.CLOUDFLARE_API_TOKEN && env.CLOUDFLARE_ACCOUNT_ID);
const deadline = Date.now() + 45 * 60_000;
let manual = (env.URLS ?? "").split(/\s+/).filter(Boolean);

interface Result {
  page: string;
  ok: boolean;
  retry?: boolean;
  error?: string;
}

while (Date.now() < deadline) {
  const pages = manual.length ? manual.splice(0) : queue ? await next(5) : [];
  if (!pages.length) break;
  const results: Result[] = [];
  let quota = false;
  for (const page of pages) {
    const ref = parsePageUrl(page);
    if (!ref) {
      results.push({ page, ok: false, error: "unsupported URL" });
      continue;
    }
    if (quota) {
      results.push({ page, ok: false, retry: true, error: "quota" });
      continue;
    }
    try {
      const summary = await translateOne(ref, opts, glossaries);
      console.log(JSON.stringify(summary));
      quota = summary.quotaExceeded;
      results.push(quota ? { page, ok: false, retry: true, error: "quota" } : { page, ok: true });
    } catch (e) {
      console.error(`failed: ${page}: ${e}`);
      results.push({ page, ok: false, error: String(e).slice(0, 300) });
    }
  }
  publish();
  if (queue) await finish(results);
  if (quota) break;
}

async function next(limit: number): Promise<string[]> {
  const res = await fetch(`${queue!.site}/api/queue/next?limit=${limit}`, { method: "POST", headers: { authorization: `Bearer ${queue!.secret}` } });
  if (!res.ok) throw new Error(`queue/next: HTTP ${res.status}`);
  return ((await res.json()) as { pages: string[] }).pages;
}

async function finish(results: Result[]) {
  const res = await fetch(`${queue!.site}/api/queue/finish`, {
    method: "POST",
    headers: { authorization: `Bearer ${queue!.secret}`, "content-type": "application/json" },
    body: JSON.stringify({ results }),
  });
  if (!res.ok) throw new Error(`queue/finish: HTTP ${res.status}`);
}

function publish() {
  const git = (...args: string[]) => execFileSync("git", args, { stdio: "inherit" });
  git("add", "content");
  try {
    execFileSync("git", ["diff", "--cached", "--quiet"]);
    return;
  } catch {}
  git("commit", "-m", "訳文を追加");
  git("pull", "--rebase", "origin", env.GITHUB_REF_NAME ?? "main");
  git("push", "origin", `HEAD:${env.GITHUB_REF_NAME ?? "main"}`);
  if (canDeploy) {
    execFileSync("npm", ["run", "build"], { stdio: "inherit" });
    execFileSync("npx", ["wrangler", "deploy"], { stdio: "inherit" });
  }
}
