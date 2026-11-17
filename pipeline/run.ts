// GitHub Actionsの翻訳ジョブの本体。
//
// 1.訳すページを決める。入力のURLがあればそれを、無ければD1の順番待ちの列から最大5件を取り出す。
// 2.訳してcontent/ に書き、コミットしてpushする。
// 3.列に結果を書く。訳せたページは「公開待ち」にする。公開(デプロイ)は別のジョブで行い、済んだら「公開済み」にする。
//    障害や無料枠の上限で訳せなかったページは列に戻し、それ以外の失敗は「失敗」にする。
// 4.公開が要るか、列にまだ残っているかを、GitHub Actionsの出力に書く。
//
// 翻訳モデルの呼び出し回数は、D1に1日分を数え、無料枠の上限の手前で止める。

import { execFileSync } from "node:child_process";
import { appendFileSync, existsSync } from "node:fs";
import { parsePageUrl } from "./sources.ts";
import { geminiCaller, QuotaExceeded, type Caller } from "./model.ts";
import { DEFAULT_CHAIN, loadGlossaries, translateOne, PageFailed } from "./job.ts";
import { wranglerD1 } from "./d1.ts";
import { takeNext, finish, countQueued, reserveCall, type D1Like } from "../src/lib/queue.ts";

// 1日に呼んでよい回数。無料枠(Flash-Lite 500回、3.8 Flash 20回)より少し少なくし、手での試訳の分を残す。
const DAILY_LIMITS: Record<string, number> = { "gemini-3.5-flash-lite": 450, "gemini-3.8-flash": 18 };
const BATCH = 5;
const DEADLINE = Date.now() + 40 * 60_000;

const env = process.env;
if (!env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set");
const db = env.CLOUDFLARE_API_TOKEN && env.CLOUDFLARE_ACCOUNT_ID ? wranglerD1() : undefined;
const call = db ? counted(geminiCaller(env.GEMINI_API_KEY), db) : geminiCaller(env.GEMINI_API_KEY);
const opts = { chain: DEFAULT_CHAIN, call, out: "content" };
const glossaries = await loadGlossaries();

interface Result {
  page: string;
  ok: boolean;
  retry?: boolean;
  error?: string;
}

const manual = (env.URLS ?? "").split(/\s+/).filter(Boolean);
const pages = manual.length ? manual : db ? await takeNext(db, BATCH) : [];
const results: Result[] = [];
try {
  for (const page of pages) {
    if (Date.now() > DEADLINE) {
      results.push({ page, ok: false, retry: true, error: "deadline" });
      continue;
    }
    const ref = parsePageUrl(page);
    if (!ref) {
      results.push({ page, ok: false, error: "unsupported URL" });
      continue;
    }
    try {
      console.log(JSON.stringify(await translateOne(ref, opts, glossaries)));
      results.push({ page, ok: true });
    } catch (e) {
      console.error(`failed: ${page}: ${e}`);
      const retry = e instanceof PageFailed ? e.retry : true;
      results.push({ page, ok: false, retry, error: e instanceof PageFailed ? e.message : "error" });
    }
  }
  commitAndPush();
} catch (e) {
  // pushまで済まなかったので、訳せたページも列に戻す。
  for (const r of results) if (r.ok) Object.assign(r, { ok: false, retry: true, error: "push failed" });
  throw e;
} finally {
  // 手で指定したページは列に無いので、列には書かない。
  if (db && !manual.length) for (const r of results) await finish(db, r.page, r.ok, r.error, r.retry);
  output("publish", String(results.some((r) => r.ok)));
  output("more", String(Boolean(db) && !manual.length && pages.length > 0 && (await countQueued(db!)) > 0 && !results.some((r) => r.error === "quota")));
}

function commitAndPush() {
  const git = (...args: string[]) => execFileSync("git", args, { stdio: "inherit" });
  if (!existsSync("content")) return;
  git("add", "content");
  try {
    execFileSync("git", ["diff", "--cached", "--quiet"]);
    return;
  } catch {}
  git("commit", "-m", "訳文を追加");
  git("pull", "--rebase", "origin", env.GITHUB_REF_NAME ?? "main");
  git("push", "origin", `HEAD:${env.GITHUB_REF_NAME ?? "main"}`);
}

// 呼ぶ前にその日の回数を数え、上限を超えるなら呼ばずに上限として扱う。
// D1にまだ表が無い(初回のデプロイ前)など、数えられないときは、Googleの上限の応答だけに頼って続ける。
function counted(inner: Caller, database: D1Like): Caller {
  let unavailable = false;
  return async (spec, segments, legend) => {
    const model = spec.split("@")[0]!;
    if (!unavailable) {
      let allowed = true;
      try {
        allowed = await reserveCall(database, model, DAILY_LIMITS[model] ?? 0);
      } catch (e) {
        unavailable = true;
        console.warn(`usage counter unavailable: ${e}`);
      }
      if (!allowed) throw new QuotaExceeded(spec, "local daily limit");
    }
    return inner(spec, segments, legend);
  };
}

function output(name: string, value: string) {
  if (env.GITHUB_OUTPUT) appendFileSync(env.GITHUB_OUTPUT, `${name}=${value}\n`);
}
