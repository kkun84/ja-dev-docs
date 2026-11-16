// GitHub Actionsで動かす翻訳の本体。
//
// 1. 訳すページを決める。入力のURLがあればそれを、無ければD1の順番待ちの列から取り出す。
// 2. 訳して content/ に書き、コミットしてpushする。
// 3. Cloudflareの設定があれば、サイトをビルドしてデプロイする。
// 4. 列に結果を書く。訳せなかったページは、無料枠の上限のときだけ列に戻す。
// 列が空になるか、時間の上限まで繰り返す。

import { execFileSync } from "node:child_process";
import { parsePageUrl } from "./sources.ts";
import { geminiCaller } from "./model.ts";
import { DEFAULT_CHAIN, loadGlossaries, translateOne } from "./job.ts";
import { wranglerD1 } from "./d1.ts";
import { takeNext, finish } from "../src/lib/queue.ts";

const env = process.env;
const apiKey = env.GEMINI_API_KEY;
if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
const opts = { chain: DEFAULT_CHAIN, call: geminiCaller(apiKey), out: "content" };
const glossaries = await loadGlossaries();
const canDeploy = Boolean(env.CLOUDFLARE_API_TOKEN && env.CLOUDFLARE_ACCOUNT_ID);
const db = canDeploy ? wranglerD1() : undefined;
const deadline = Date.now() + 45 * 60_000;
let manual = (env.URLS ?? "").split(/\s+/).filter(Boolean);

interface Result {
  page: string;
  ok: boolean;
  retry?: boolean;
  error?: string;
}

while (Date.now() < deadline) {
  const pages = manual.length ? manual.splice(0) : db ? await takeNext(db, 5).catch((e) => (console.error(`queue: ${e}`), [])) : [];
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
  if (db) for (const r of results) await finish(db, r.page, r.ok, r.error, r.retry);
  if (quota) break;
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
    execFileSync("bash", ["scripts/deploy.sh"], { stdio: "inherit" });
  }
}
