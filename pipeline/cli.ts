// 原文のURLを受け取り、ページを訳して content/ に書き出す。
//
//   node pipeline/cli.ts --chain gemini-3.5-flash-lite gemini-3.5-flash-lite gemini-3.8-flash@low <URL>...
//
// 訳文は content/<ホスト>/<パス>/<モデル>.md、記録は同じ名前の .json に書く。

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { parseArgs } from "node:util";
import { parse as parseYaml } from "yaml";
import { parsePageUrl, rawUrl, loadVariables, httpFetcher, type PageRef } from "./sources.ts";
import { translatePage } from "./page.ts";
import { geminiCaller, sleep } from "./model.ts";

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    chain: { type: "string", multiple: true },
    out: { type: "string", default: "content" },
  },
});
const chain = values.chain ?? ["gemini-3.5-flash-lite", "gemini-3.5-flash-lite", "gemini-3.8-flash@low"];
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
const call = geminiCaller(apiKey);
const glossaries = (parseYaml(await readFile("data/glossary.yml", "utf8")) ?? {}) as Record<string, Record<string, string>>;

let failed = 0;
for (const input of positionals) {
  const ref = parsePageUrl(input);
  if (!ref) {
    console.error(`unsupported URL: ${input}`);
    failed++;
    continue;
  }
  try {
    const summary = await translateOne(ref);
    console.log(JSON.stringify(summary));
  } catch (e) {
    console.error(`failed: ${input}: ${e}`);
    failed++;
  }
}
process.exitCode = failed ? 1 : 0;

async function translateOne(ref: PageRef) {
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

  const paths = [...text.matchAll(/\{%-?\s*data\s+variables\.([\w.\-]+)/g)].map((m) => m[1]!);
  const variables = await loadVariables({ ...source, branch: commit ?? source.branch }, paths);
  const model = chain[0]!.split("@")[0]!;
  const started = new Date();
  const result = await translatePage(text, {
    seed: `${source.host}/${ref.path}/${started.toISOString()}`,
    chain,
    call,
    variables,
    glossary: glossaries[source.host] ?? {},
  });

  const base = join(values.out!, source.host, ref.path || "index", model);
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
  return { url: record.url, segments: record.segments, segmentsByModel: counts, untranslated: record.untranslated.length };
}

// 原文のブランチの最新コミット。訳文がどの版の原文から作られたかを記録し、同じ版の変数を使うため。
async function latestCommit(repo: string, branch: string): Promise<string | undefined> {
  const headers: Record<string, string> = { accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch(`https://api.github.com/repos/${repo}/commits/${branch}`, { headers });
  if (!res.ok) return undefined;
  return ((await res.json()) as { sha: string }).sha;
}
