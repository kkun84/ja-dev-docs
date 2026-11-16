// 1ページを訳して content/ に書き出す処理。cli.ts と run.ts から使う。

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { parse as parseYaml } from "yaml";
import { rawUrl, loadVariables, httpFetcher, type PageRef } from "./sources.ts";
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
  const model = chain[0]!.split("@")[0]!;
  const started = new Date();
  const result = await translatePage(text, {
    seed: `${source.host}/${ref.path}/${started.toISOString()}`,
    chain,
    call,
    variables,
    glossary: glossaries[source.host] ?? {},
  });

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
    reusables: [...new Set([...text.matchAll(/\{%-?\s*data\s+(reusables\.[\w.\-\/]+)/g)].map((m) => m[1]!))],
    steps: result.steps.map(({ spec, sent, failed, finishReason, seconds, error }) => ({ spec, sent, failed, finishReason, seconds, error })),
  };
  await writeFile(`${base}.json`, JSON.stringify(record, null, 2) + "\n");
  await sleep(4000);
  return { url: record.url, segments: record.segments, segmentsByModel: counts, untranslated: record.untranslated.length, quotaExceeded: result.steps.every((s) => s.error?.includes("quota")) };
}

// 原文のブランチの最新コミット。訳文がどの版の原文から作られたかを記録し、同じ版の変数を使うため。
async function latestCommit(repo: string, branch: string): Promise<string | undefined> {
  const headers: Record<string, string> = { accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch(`https://api.github.com/repos/${repo}/commits/${branch}`, { headers });
  if (!res.ok) return undefined;
  return ((await res.json()) as { sha: string }).sha;
}

