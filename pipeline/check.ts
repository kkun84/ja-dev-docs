// 断片ごとの検査。目印、HTMLタグ、改行、訳し漏れを見る。

import { tokensIn } from "./mask.ts";

const HTML_TAG_RE = /<\/?[A-Za-z][^>]*>/g;
const JAPANESE_RE = /[぀-ヿ㐀-鿿]/;

export function segmentErrors(source: string, output: string | undefined): string[] {
  if (output === undefined) return ["missing"];
  const errors: string[] = [];
  if (output.includes("\n")) errors.push("newline");
  if (!same(tokensIn(source), tokensIn(output))) errors.push("placeholder");
  if (!same(tags(source), tags(output))) errors.push("html tag");
  if (/⟦|⟧/.test(output.replace(/⟦[^⟧\s]{1,12}⟧/g, ""))) errors.push("broken placeholder");
  // 小文字で始まる語(the、andなど)が3つ以上ある文なのに日本語が無いものは、訳し漏れとみなす。
  // 製品名だけの断片(Visual Studio Code 1.147 など)は大文字で始まる語なので、英語のままでよい。
  const words = source.replace(/⟦[^⟧]*⟧/g, " ").replace(HTML_TAG_RE, " ").match(/\b[a-z][a-z]+\b/g) ?? [];
  if (words.length >= 3 && !JAPANESE_RE.test(output)) errors.push("untranslated");
  return errors;
}

function tags(text: string): string[] {
  return (text.match(HTML_TAG_RE) ?? []).sort();
}

function same(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((x, i) => x === b[i]);
}

const CJK = "\\u3000-\\u30ff\\u3400-\\u9fff\\uff00-\\uffef";
const SPACE_AFTER_CJK = new RegExp(`(?<=[${CJK}]) +(?=\\S)`, "g");
const SPACE_BEFORE_CJK = new RegExp(`(?<=\\S) +(?=[${CJK}])`, "g");

// 日本語と英数字や記号の間の空白を除く。モデルに指示しても多く入るため、機械的に直す。
export function tidy(text: string): string {
  return text.replace(SPACE_AFTER_CJK, "").replace(SPACE_BEFORE_CJK, "");
}
