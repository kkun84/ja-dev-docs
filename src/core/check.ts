/**
 * 断片ごとの検査。モデルの出力は信用できない入力として扱い、構造、リンク、HTML、目印、訳し漏れを見る。
 */
import type { Nodes } from "mdast"
import { HTML_TAG, parseMarkdown } from "./markdown.ts"
import { sortedTokenIds } from "./mask.ts"
import type { SegmentKind } from "./segment.ts"
import { capture } from "./text.ts"

/** 断片の訳を採らない理由。 */
export type SegmentError =
  | "missing"
  | "newline"
  | "placeholder"
  | "broken placeholder"
  | "html tag"
  | "block structure"
  | "table pipe"
  | "new link"
  | "untranslated"

// 閉じていないタグも数えるため、<の直後の文字で数える。
const TAG_START = /<[A-Za-z/!?]/g
const JAPANESE = /[　-ヿ㐀-鿿＀-￯]/
const UNESCAPED_PIPE = /(?<!\\)\|/g
const URL_ATTRIBUTE = /\b(?:href|src|action|formaction|srcset)\s*=\s*["']?([^"'\s>]+)/gi

const same = (left: ReadonlyArray<string>, right: ReadonlyArray<string>): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index])

const count = (text: string, pattern: RegExp): number => text.match(pattern)?.length ?? 0

const tags = (text: string): ReadonlyArray<string> => (text.match(HTML_TAG) ?? []).toSorted()

const urlsOfNode = (node: Nodes): ReadonlyArray<string> => {
  if (node.type === "link" || node.type === "image" || node.type === "definition") {
    return node.url === "" ? [] : [node.url]
  }
  return node.type === "html" ? [...node.value.matchAll(URL_ATTRIBUTE)].map((match) => capture(match, 1)) : []
}

const urls = (node: Nodes): ReadonlyArray<string> => [
  ...urlsOfNode(node),
  ...("children" in node ? node.children.flatMap((child) => urls(child)) : [])
]

const blockTypes = (text: string): ReadonlyArray<string> => parseMarkdown(text).children.map((child) => child.type)

// 小文字で始まる語(the、andなど)が3つ以上ある文なのに日本語が無いものは、訳し漏れとみなす。
// 製品名だけの断片(Visual Studio Code 1.147など)は大文字で始まる語なので、英語のままでよい。
// リンクだけの断片(関連ページの題名の一覧など)は、題名を英語のまま残してよい。
const isUntranslated = (source: string, output: string): boolean => {
  const prose = source
    .replaceAll(/\[[^\]]*\]\(⟦\w+⟧\)/g, " ")
    .replaceAll(/⟦[^⟧]*⟧/g, " ")
    .replace(HTML_TAG, " ")
  return count(prose, /\b[a-z][a-z]+\b/g) >= 3 && !JAPANESE.test(output)
}

const hasNewLink = (source: string, output: string): boolean => {
  const allowed = new Set(urls(parseMarkdown(source)))
  return urls(parseMarkdown(output)).some((url) => !allowed.has(url))
}

const htmlChanged = (source: string, output: string): boolean =>
  !same(tags(source), tags(output)) || count(source, TAG_START) !== count(output, TAG_START)

/** 断片の訳を検査し、採らない理由を返す。空なら採ってよい。 */
export const segmentErrors = (source: string, output: string | undefined, kind: SegmentKind = "paragraph"): ReadonlyArray<SegmentError> => {
  if (output === undefined) {
    return ["missing"]
  }
  const checks: ReadonlyArray<readonly [SegmentError, boolean]> = [
    ["newline", output.includes("\n")],
    ["placeholder", !same(sortedTokenIds(source), sortedTokenIds(output))],
    ["broken placeholder", /[⟦⟧]/.test(output.replaceAll(/⟦[^⟧\s]{1,12}⟧/g, ""))],
    ["html tag", htmlChanged(source, output)],
    // 断片を単独で構文解析し、ブロックの種類が原文と同じかを見る。訳に「> 」や「1.」が入ると、引用やリストに変わるため。
    ["block structure", kind !== "front" && !same(blockTypes(source), blockTypes(output))],
    ["table pipe", kind === "cell" && count(source, UNESCAPED_PIPE) !== count(output, UNESCAPED_PIPE)],
    // 訳にリンクを足させない。訳のリンク先は、すべて原文にあるもの(目印)でなければならない。
    ["new link", hasNewLink(source, output)],
    ["untranslated", isUntranslated(source, output)]
  ]
  return checks.filter(([, failed]) => failed).map(([error]) => error)
}

const CJK = String.raw`　-ヿ㐀-鿿＀-￯`
const SPACE_AFTER_CJK = new RegExp(`(?<=[${CJK}]) +(?=\\S)`, "g")
const SPACE_BEFORE_CJK = new RegExp(`(?<=\\S) +(?=[${CJK}])`, "g")

/**
 * 日本語と英数字や記号の間の空白を除く。モデルに指示しても多く入るため、機械的に直す。
 *
 * `keep`に入っている目印(裸のURL)の前後の空白は残す。除くと、自動リンクが後ろの日本語までURLに含めてしまう。
 */
export const tidy = (text: string, keep: ReadonlySet<string> = new Set()): string => {
  let tidied = text.replaceAll(SPACE_AFTER_CJK, "").replaceAll(SPACE_BEFORE_CJK, "")
  for (const id of keep) {
    tidied = tidied
      .replaceAll(new RegExp(`(?<=[^\\s(\\[<])⟦${id}⟧`, "g"), ` ⟦${id}⟧`)
      .replaceAll(new RegExp(`⟦${id}⟧(?=[^\\s)\\]>.,;:!?])`, "g"), `⟦${id}⟧ `)
  }
  return tidied
}
