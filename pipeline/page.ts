// 1ページを訳す。骨組みを取り出し、断片を訳し、検査し、組み立てる。

import { parse as parseYaml } from "yaml";
import { Masker, TOKEN_RE, type Masked } from "./mask.ts";
import { prepare, assemble, maskBlocks, maskInline, hasText, type Segment, type VariableResolver } from "./segment.ts";
import { segmentErrors, tidy } from "./check.ts";
import { QuotaExceeded, type Caller, type CallResult } from "./model.ts";

// フロントマターのうち、訳すキー。
const FRONT_MATTER_KEYS = ["title", "shortTitle", "intro", "PageTitle", "MetaDescription"];

export interface StepLog {
  spec: string;
  sent: number;
  failed: { id: number; errors: string[] }[];
  finishReason?: string;
  usage?: unknown;
  seconds: number;
  error?: string;
}

export interface PageResult {
  markdown: string;
  headings: string[];
  segments: number;
  // 断片ごとに、どのモデルの訳を使ったか。訳せず原文のまま残した断片は含まない。
  usedModel: Record<number, string>;
  untranslated: number[];
  steps: StepLog[];
}

export interface TranslateOptions {
  seed: string;
  chain: string[];
  call: Caller;
  variables: VariableResolver;
  // 変数ごとの訳語。書いていない変数は値(英語)のまま。
  glossary: Record<string, string>;
}

export async function translatePage(text: string, opts: TranslateOptions): Promise<PageResult> {
  const masker = new Masker(opts.seed);
  const fm = /^---\n([\s\S]*?)\n---\n/.exec(text);
  const body = fm ? text.slice(fm[0].length) : text;
  const prep = prepare(body, masker, opts.variables);
  const segments = [...prep.segments];

  // フロントマターはLiquidを含み、厳密なYAMLでないことがあるので、1行の「キー: 値」だけを行単位で扱う。
  const fmLines = fm ? fm[1]!.split("\n") : [];
  const fmSegments = new Map<number, Segment>();
  fmLines.forEach((line, index) => {
    const m = /^(\w+):[ \t]+(.+)$/.exec(line);
    if (!m || !FRONT_MATTER_KEYS.includes(m[1]!)) return;
    const value = scalar(m[2]!);
    if (value === undefined || !hasText(value)) return;
    const seg = { id: segments.length + 1, text: maskInline(maskBlocks(value, masker, opts.variables), masker) };
    segments.push(seg);
    fmSegments.set(index, seg);
  });

  const { done, usedModel, steps } = await translateSegments(segments, masker, opts);

  const render = (m: Masked) => {
    if (m.kind !== "variable") return m.original;
    const path = /variables\.([\w.\-]+)/.exec(m.original)![1]!;
    return opts.glossary[path] ?? m.meaning;
  };
  let outBody = masker.unmask(assemble(prep, done), render);
  if (body.endsWith("\n") && !outBody.endsWith("\n")) outBody += "\n";
  for (const [index, seg] of fmSegments) {
    const t = done.get(seg.id);
    if (t !== undefined) fmLines[index] = fmLines[index]!.replace(/^(\w+):.*$/, (_, k: string) => `${k}: ${JSON.stringify(masker.unmask(t, render))}`);
  }
  const front = fm ? `---\n${fmLines.join("\n")}\n---\n` : "";
  return {
    markdown: front + outBody,
    headings: prep.headings,
    segments: segments.length,
    usedModel: Object.fromEntries(usedModel),
    untranslated: segments.filter((s) => !done.has(s.id)).map((s) => s.id),
    steps,
  };
}

// chainの順にモデルを使い、検査に落ちた断片だけを次へ回す。
export async function translateSegments(segments: Segment[], masker: Masker, opts: Pick<TranslateOptions, "chain" | "call">) {
  const done = new Map<number, string>();
  const usedModel = new Map<number, string>();
  const steps: StepLog[] = [];
  let pending = segments;
  for (const spec of opts.chain) {
    if (!pending.length) break;
    const started = Date.now();
    const legend: Record<string, string> = {};
    for (const s of pending) for (const m of s.text.matchAll(TOKEN_RE)) legend[m[1]!] = masker.store.get(m[1]!)?.meaning ?? "";
    const step: StepLog = { spec, sent: pending.length, failed: [], seconds: 0 };
    try {
      const result = await callInBatches(opts.call, spec, pending, legend);
      step.finishReason = result.finishReason;
      step.usage = result.usage;
      for (const s of pending) {
        let out = result.translations.get(s.id);
        if (out !== undefined) out = tidy(masker.repair(out));
        const errors = segmentErrors(s.text, out);
        if (errors.length) step.failed.push({ id: s.id, errors });
        else {
          done.set(s.id, out!);
          usedModel.set(s.id, spec.split("@")[0]!);
        }
      }
    } catch (e) {
      step.error = String(e).slice(0, 500);
      step.failed = pending.map((s) => ({ id: s.id, errors: [e instanceof QuotaExceeded ? "quota" : "request"] }));
    }
    step.seconds = (Date.now() - started) / 1000;
    steps.push(step);
    pending = pending.filter((s) => !done.has(s.id));
  }
  return { done, usedModel, steps };
}

// YAMLの1行の値を読む。引用符で囲まれていればYAMLとして解釈し、囲まれていなければそのまま使う。
function scalar(raw: string): string | undefined {
  const v = raw.trim();
  if (/^['"]/.test(v)) {
    try {
      const parsed = parseYaml(`v: ${v}`) as { v: unknown };
      return typeof parsed.v === "string" ? parsed.v : undefined;
    } catch {
      return undefined;
    }
  }
  if (/^[|>&*!\[{]/.test(v)) return undefined;
  return v.replace(/\s+#.*$/, "");
}

// 断片が多いと、モデルの出力の上限や要求の大きさの上限にかかる。1回に送る断片の数を抑え、
// それでも要求が拒否されたら半分に分けて送り直す。文脈が切れすぎないよう、1回の上限は大きめにする。
const BATCH = 120;

async function callInBatches(call: Caller, spec: string, segments: Segment[], legend: Record<string, string>): Promise<CallResult> {
  if (segments.length > BATCH) {
    const results = [];
    for (let i = 0; i < segments.length; i += BATCH) results.push(await callInBatches(call, spec, segments.slice(i, i + BATCH), legend));
    return merge(results);
  }
  try {
    return await call(spec, segments, pick(legend, segments));
  } catch (e) {
    if (e instanceof QuotaExceeded || segments.length < 2 || !/HTTP 400/.test(String(e))) throw e;
    const half = Math.ceil(segments.length / 2);
    return merge([await callInBatches(call, spec, segments.slice(0, half), legend), await callInBatches(call, spec, segments.slice(half), legend)]);
  }
}

function pick(legend: Record<string, string>, segments: Segment[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const s of segments) for (const m of s.text.matchAll(TOKEN_RE)) if (m[1]! in legend) out[m[1]!] = legend[m[1]!]!;
  return out;
}

function merge(results: CallResult[]): CallResult {
  const translations = new Map<number, string>();
  for (const r of results) for (const [k, v] of r.translations) translations.set(k, v);
  return { translations, finishReason: results.map((r) => r.finishReason).find((f) => f !== "STOP") ?? "STOP", usage: results.map((r) => r.usage) };
}
