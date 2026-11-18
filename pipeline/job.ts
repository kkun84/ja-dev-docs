// 1ページを訳してcontent/ に書き出す処理。cli.tsとrun.tsから使う。

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { parse as parseYaml } from "yaml";
import { rawUrl, loadVariables, httpFetcher, type PageRef, type Source } from "./sources.ts";
import type { Keybinding } from "./segment.ts";
import { expandLiquid } from "./liquid.ts";
import { githubContext } from "./github.ts";
import { translatePage } from "./page.ts";
import { sleep, type Caller } from "./model.ts";

export const DEFAULT_CHAIN = ["gemini-3.5-flash-lite", "gemini-3.5-flash-lite", "gemini-3.8-flash@low"];

export interface JobOptions {
  chain: string[];
  call: Caller;
  out: string;
}

export async function loadGlossaries(): Promise<Record<string, Record<string, string>>> {
  return (parseYaml(await readFile("data/glossary.yml", "utf8")) ?? {}) as Record<string, Record<string, string>>;
}

export async function translateOne(ref: PageRef, opts: JobOptions, glossaries: Record<string, Record<string, string>>) {
  const { chain, call } = opts;
  const { source } = ref;
  const commit = await latestCommit(source.repo, source.branch);
  let file: string | undefined;
  let text: string | undefined;
  for (const candidate of source.candidates(ref.path)) {
    text = await httpFetcher(rawUrl({ ...source, branch: commit ?? source.branch }, candidate));
    if (text !== undefined) {
      file = candidate;
      break;
    }
  }
  if (!file || text === undefined) throw new Error("source file not found");
  const pinned = { ...source, branch: commit ?? source.branch };
  if (source.host === "docs.github.com") {
    const fm = /^---\n[\s\S]*?\n---\n/.exec(text)?.[0] ?? "";
    text = fm + (await expandLiquid(text.slice(fm.length), githubContext(pinned)));
  }

  const paths = [...text.matchAll(/\{%-?\s*data\s+variables\.([\w.\-]+)/g)].map((m) => m[1]!);
  const variables = await loadVariables(pinned, paths);
  const keybinding = source.host === "code.visualstudio.com" ? await loadKeybindings(pinned) : undefined;
  const started = new Date();
  const result = await translatePage(text, {
    seed: `${source.host}/${ref.path}/${started.toISOString()}`,
    chain,
    call,
    variables,
    keybinding,
    glossary: glossaries[source.host] ?? {},
  });

  // 訳せなかった断片が多いページは公開しない。APIの障害やその日の上限で全部が落ちたページを、英語のまま「翻訳済み」にしないため。
  const failedRatio = result.untranslated.length / Math.max(result.segments, 1);
  if (failedRatio > MAX_UNTRANSLATED_RATIO) {
    const apiTrouble = result.steps.some((s) => s.error);
    const quota = result.steps.some((s) => s.error === "quota");
    // ログで原因が分かるよう、段ごとに、送った数、落ちた数、落ちた理由の内訳、APIのエラーの種類を出す。
    for (const st of result.steps) {
      const reasons: Record<string, number> = {};
      for (const f of st.failed) for (const e of f.errors) reasons[e] = (reasons[e] ?? 0) + 1;
      console.error(`  ${st.spec}: sent ${st.sent}, failed ${st.failed.length}, ${st.seconds}s, ${st.error ?? "ok"}, ${JSON.stringify(reasons)}`);
    }
    throw new PageFailed(quota ? "quota" : `${result.untranslated.length} of ${result.segments} segments untranslated`, apiTrouble);
  }

  const model = result.primaryModel ?? chain[0]!.split("@")[0]!;
  const base = join(opts.out, source.host, ref.path || "index", model);
  await mkdir(dirname(base), { recursive: true });
  await writeFile(`${base}.md`, result.markdown);
  const counts: Record<string, number> = {};
  for (const m of Object.values(result.usedModel)) counts[m] = (counts[m] ?? 0) + 1;
  const record = {
    url: `https://${source.host}/${ref.path}`,
    repo: source.repo,
    file,
    commit,
    translatedAt: started.toISOString(),
    model,
    chain,
    segments: result.segments,
    segmentsByModel: counts,
    untranslated: result.untranslated,
    headings: result.headings,
    // 展開できずに残ったLiquidのタグ。表示が崩れる原因になるので、気づけるように残す。
    unresolvedLiquid: [...new Set([...text.matchAll(/\{%-?\s*(\w+)[^%\n]*%\}/g)].map((m) => m[1]!).filter((t) => t !== "data" && t !== "raw" && t !== "endraw"))],
    steps: result.steps.map(({ spec, sent, failed, finishReason, seconds, error }) => ({ spec, sent, failed, finishReason, seconds, error })),
  };
  await writeFile(`${base}.json`, JSON.stringify(record, null, 2) + "\n");
  await sleep(4000);
  return { url: record.url, model, segments: record.segments, segmentsByModel: counts, untranslated: record.untranslated.length };
}

// 未訳の断片がこの割合を超えたページは公開しない。
const MAX_UNTRANSLATED_RATIO = 0.05;

export class PageFailed extends Error {
  // retry: APIの障害や上限が原因で、時間をおけば訳せる見込みがある。
  readonly retry: boolean;
  constructor(message: string, retry: boolean) {
    super(message);
    this.retry = retry;
  }
}

// VS Codeのkb(コマンド) を、既定のキー割り当てに変える表。原文のリポジトリのbuild/keybindingsから作る。
async function loadKeybindings(source: Source): Promise<(command: string) => Keybinding | undefined> {
  const load = async (os: string) => {
    const text = await httpFetcher(rawUrl(source, `build/keybindings/doc.keybindings.${os}.json`));
    const map = new Map<string, string>();
    for (const { key, command } of (text ? JSON.parse(text) : []) as { key: string; command: string }[]) if (!map.has(command)) map.set(command, key);
    return map;
  };
  const [win, mac] = await Promise.all([load("win"), load("osx")]);
  return (command) => {
    const w = win.get(command);
    const m = mac.get(command);
    return w || m ? { win: formatKeys(w ?? m!, false), mac: formatKeys(m ?? w!, true) } : undefined;
  };
}

const MAC_SYMBOLS: Record<string, string> = { ctrl: "⌃", alt: "⌥", shift: "⇧", cmd: "⌘" };

export function formatKeys(binding: string, mac: boolean): string {
  return binding
    .split(" ")
    .map((chord) => {
      const parts = chord.split("+");
      const key = parts.pop()!;
      const name = key.length === 1 ? key.toUpperCase() : key.charAt(0).toUpperCase() + key.slice(1);
      if (!mac) return [...parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)), name].join("+");
      return ["ctrl", "alt", "shift", "cmd"].filter((m) => parts.includes(m)).map((m) => MAC_SYMBOLS[m]).join("") + name;
    })
    .join(" ");
}

// 原文のブランチの最新コミット。訳文がどの版の原文から作られたかを記録し、同じ版の変数を使うため。
async function latestCommit(repo: string, branch: string): Promise<string | undefined> {
  const headers: Record<string, string> = { accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch(`https://api.github.com/repos/${repo}/commits/${branch}`, { headers });
  if (!res.ok) return undefined;
  return ((await res.json()) as { sha: string }).sha;
}

