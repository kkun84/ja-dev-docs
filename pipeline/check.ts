// 断片ごとの検査。モデルの出力は信用できない入力として扱い、構造、リンク、HTML、目印、訳し漏れを見る。

import type { Nodes } from "mdast";
import { tokensIn } from "./mask.ts";
import { parseMarkdown, type SegmentKind } from "./segment.ts";

const HTML_TAG_RE = /<\/?[A-Za-z][^>]*>/g;
// 閉じていないタグも数えるため、< の直後の文字で数える。
const TAG_START_RE = /<[A-Za-z\/!?]/g;
const JAPANESE_RE = /[　-ヿ㐀-鿿＀-￯]/;

export function segmentErrors(source: string, output: string | undefined, kind: SegmentKind = "paragraph"): string[] {
  if (output === undefined) return ["missing"];
  const errors: string[] = [];
  if (output.includes("\n")) errors.push("newline");
  if (!same(tokensIn(source), tokensIn(output))) errors.push("placeholder");
  if (/⟦|⟧/.test(output.replace(/⟦[^⟧\s]{1,12}⟧/g, ""))) errors.push("broken placeholder");
  if (!same(tags(source), tags(output)) || count(source, TAG_START_RE) !== count(output, TAG_START_RE)) errors.push("html tag");

  // 断片を単独で構文解析し、ブロックの種類が原文と同じかを見る。訳に「> 」や「1.」が入ると、引用やリストに変わるため。
  const src = parseMarkdown(source);
  const out = parseMarkdown(output);
  if (kind !== "front" && !same(src.children.map((c) => c.type), out.children.map((c) => c.type))) errors.push("block structure");
  if (kind === "cell" && count(source, /(?<!\\)\|/g) !== count(output, /(?<!\\)\|/g)) errors.push("table pipe");

  // 訳にリンクを足させない。訳のリンク先は、すべて原文にあるもの(目印)でなければならない。
  const allowed = new Set(urls(src));
  if (urls(out).some((u) => !allowed.has(u))) errors.push("new link");

  // 小文字で始まる語(the、andなど)が3つ以上ある文なのに日本語が無いものは、訳し漏れとみなす。
  // 製品名だけの断片(Visual Studio Code 1.147など)は大文字で始まる語なので、英語のままでよい。
  // リンクだけの断片(関連ページの題名の一覧など)は、題名を英語のまま残してよい。
  const prose = source.replace(/\[[^\]]*\]\(⟦\w+⟧\)/g, " ");
  const words = prose.replace(/⟦[^⟧]*⟧/g, " ").replace(HTML_TAG_RE, " ").match(/\b[a-z][a-z]+\b/g) ?? [];
  if (words.length >= 3 && !JAPANESE_RE.test(output)) errors.push("untranslated");
  return errors;
}

function urls(tree: Nodes): string[] {
  const out: string[] = [];
  const walk = (n: Nodes) => {
    if ((n.type === "link" || n.type === "image" || n.type === "definition") && n.url) out.push(n.url);
    if (n.type === "html") for (const m of n.value.matchAll(/\b(?:href|src|action|formaction|srcset)\s*=\s*["']?([^"'\s>]+)/gi)) out.push(m[1]!);
    if ("children" in n) for (const c of n.children) walk(c as Nodes);
  };
  walk(tree);
  return out;
}

function tags(text: string): string[] {
  return (text.match(HTML_TAG_RE) ?? []).sort();
}

function count(text: string, re: RegExp): number {
  return (text.match(re) ?? []).length;
}

function same(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((x, i) => x === b[i]);
}

const CJK = "\\u3000-\\u30ff\\u3400-\\u9fff\\uff00-\\uffef";
const SPACE_AFTER_CJK = new RegExp(`(?<=[${CJK}]) +(?=\\S)`, "g");
const SPACE_BEFORE_CJK = new RegExp(`(?<=\\S) +(?=[${CJK}])`, "g");

// 日本語と英数字や記号の間の空白を除く。モデルに指示しても多く入るため、機械的に直す。
// keep に入っている目印(裸のURL)の前後の空白は残す。除くと、自動リンクが後ろの日本語までURLに含めてしまう。
export function tidy(text: string, keep: Set<string> = new Set()): string {
  text = text.replace(SPACE_AFTER_CJK, "").replace(SPACE_BEFORE_CJK, "");
  for (const id of keep) {
    text = text.replace(new RegExp(`(?<=[^\\s(\\[<])⟦${id}⟧`, "g"), ` ⟦${id}⟧`).replace(new RegExp(`⟦${id}⟧(?=[^\\s)\\]>.,;:!?])`, "g"), `⟦${id}⟧ `);
  }
  return text;
}
