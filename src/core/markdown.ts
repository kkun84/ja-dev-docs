import type { Root } from "mdast"
import remarkGfm from "remark-gfm"
import remarkParse from "remark-parse"
import { unified } from "unified"

const parser = unified().use(remarkParse).use(remarkGfm)

/** MarkdownをGFMとして構文解析する。 */
export const parseMarkdown = (text: string): Root => parser.parse(text)

/** HTMLの開始タグと終了タグ。 */
export const HTML_TAG = /<\/?[A-Za-z][^>]*>/g
