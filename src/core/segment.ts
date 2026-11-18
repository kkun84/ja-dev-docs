/**
 * Markdownの骨組みはプログラムが持ち、文の部分だけを断片として取り出す。
 *
 * 原文の文字列はそのまま残し、段落・見出し・表のセル・HTMLブロックの行の範囲だけを訳文に差し替える。
 * 見出しやリストの記号、字下げ、コードブロックはモデルに渡らないので、構造は壊れない。
 */
import type { Heading, Html, Nodes, TableCell } from "mdast"
import { toString } from "mdast-util-to-string"
import { HTML_TAG, parseMarkdown } from "./markdown.ts"
import type { Masker } from "./mask.ts"
import { capture } from "./text.ts"

export type SegmentKind = "paragraph" | "heading" | "cell" | "html" | "front"

/** モデルに渡す文1つ。行内コードやリンク先は目印になっている。 */
export interface Segment {
  readonly id: number
  readonly text: string
}

interface Range {
  readonly start: number
  readonly end: number
  /** 範囲の前に固定で残す部分(GitHubのアラートの`[!NOTE]`など)。 */
  readonly head: string
  readonly segment: Segment
  /** 訳さなかったときに戻す、範囲の元の文字列。 */
  readonly original: string
}

/** 断片を取り出した本文。 */
export interface Prepared {
  readonly masked: string
  readonly ranges: ReadonlyArray<Range>
  readonly segments: ReadonlyArray<Segment>
  readonly kinds: ReadonlyMap<number, SegmentKind>
  /** 原文の見出し。訳文の見出しのIDを、原文と同じにするために残す。 */
  readonly headings: ReadonlyArray<string>
}

/** VS Codeの`kb(コマンド)`の、既定のキー割り当て。 */
export interface Keybinding {
  readonly win: string
  readonly mac: string
}

export interface MaskOptions {
  /** `{% data variables.… %}`の値。値を決められない変数は`undefined`。 */
  readonly variables: (path: string) => string | undefined
  readonly keybinding?: ((command: string) => Keybinding | undefined) | undefined
}

// Liquidのタグは1行の中だけで探す。行をまたいで探すと、別々の段落の{{と}}が組になり、間の本文を飲み込む。
const LIQUID = /\{%-?[^\n]*?-?%\}|\{\{[^\n]*?\}\}/g
const VARIABLE = /^\{%-?\s*data\s+variables\.([\w.-]+)\s*-?%\}$/
const ALERT = /^\[!(?:NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]$/
const CONTINUATION_PREFIX = /^[ \t]*(?:>[ \t]?)*[ \t]*/
const HARD_BREAK = /( {2,}|\\)$/
const RAW_HTML_START = /<(?:pre|script|style|code|textarea)\b/i
const RAW_HTML_END = /<\/(?:pre|script|style|code|textarea)>/i

const prefixOf = (line: string): string => capture(CONTINUATION_PREFIX.exec(line), 0)

const maskKeybindings = (body: string, masker: Masker, keybinding: (command: string) => Keybinding | undefined): string =>
  body.replaceAll(/\bkb\(([\w.-]+)\)/g, (all, command: string) => {
    const keys = keybinding(command)
    return masker.put("kbd", all, keys === undefined ? `keyboard shortcut for the command ${command}` : `keyboard shortcut ${keys.win}`)
  })

/** 本文(フロントマターを除いたもの)に、ブロック全体に効く目印を置く。HTMLコメント、Liquidタグ、`kb()`。 */
export const maskBlocks = (body: string, masker: Masker, options: MaskOptions): string => {
  const withoutComments = body.replaceAll(/<!--[\s\S]*?-->/g, (comment) => masker.put("comment", comment))
  const withoutLiquid = withoutComments.replaceAll(LIQUID, (tag) => {
    const path = VARIABLE.exec(tag)?.[1]
    const value = path === undefined ? undefined : options.variables(path)
    return value === undefined ? masker.put("liquid", tag) : masker.put("variable", tag, value)
  })
  return options.keybinding === undefined ? withoutLiquid : maskKeybindings(withoutLiquid, masker, options.keybinding)
}

/** 断片の中で、モデルに書き換えさせたくない行内の部分を目印にする。行内コード、リンク先、URL。 */
export const maskInline = (text: string, masker: Masker): string =>
  text
    .replaceAll(/(`+)(?!`)([\s\S]+?)(?<!`)\1(?!`)/g, (code) => masker.put("code", code))
    .replaceAll(
      /(\]\()(<[^>]*>|[^)\s]+)((?:\s+"[^"]*")?\))/g,
      (_all, open: string, url: string, close: string) => open + masker.put("url", url) + close
    )
    .replaceAll(/<(?:https?|mailto):[^>\s]+>/g, (autolink) => masker.put("url", autolink))
    .replaceAll(/(?<![\w(⟦/"'=])https?:\/\/[^\s<>()\]`]+[^\s<>()\]`.,;:!?'"]/g, (url) => masker.put("bareurl", url))

/** 訳す文字(英字)があるか。目印とHTMLタグだけの文は訳さない。 */
export const hasText = (text: string): boolean => /[A-Za-z]/.test(text.replaceAll(/⟦[^⟧]*⟧/g, "").replace(HTML_TAG, ""))

/** 断片を集めている途中の状態。 */
interface Collector {
  readonly masked: string
  readonly masker: Masker
  readonly ranges: Range[]
  readonly segments: Segment[]
  readonly kinds: Map<number, SegmentKind>
  readonly headings: string[]
}

// 行をつなぐ。硬い改行(行末の空白2つか\)は、改行と次の行の字下げごと目印にして保つ。
const joinLines = (lines: ReadonlyArray<string>, first: number, masker: Masker): string => {
  let text = ""
  for (let index = first; index < lines.length; index += 1) {
    const raw = lines[index] ?? ""
    const prefix = index === 0 ? "" : prefixOf(raw)
    const isLast = index === lines.length - 1
    if (index > first) {
      const hardBreak = HARD_BREAK.exec(text)?.[1]
      text =
        hardBreak === undefined
          ? `${text} `
          : text.slice(0, -hardBreak.length) + masker.put("break", `${hardBreak}\n${prefix}`, "line break")
    }
    const line = raw.slice(prefix.length)
    text += isLast ? line.trimEnd() : line.replace(/[ \t]+$/, (spaces) => (spaces.length >= 2 ? spaces : ""))
  }
  return text.trim()
}

// 範囲の先頭が[!NOTE]の行なら、その行と、次の行の字下げや>を、訳さずに残す部分として切り出す。
const alertHead = (lines: ReadonlyArray<string>): string => {
  const [first, second] = lines
  return first !== undefined && second !== undefined && ALERT.test(first.trim()) ? `${first}\n${prefixOf(second)}` : ""
}

const add = (collector: Collector, from: number, end: number, kind: SegmentKind): void => {
  const lines = collector.masked.slice(from, end).split("\n")
  const head = alertHead(lines)
  const start = from + head.length
  // 行内コードやURLを目印にした後で、訳す文字が残っているかを見る。コードだけの表のセルなどは、モデルに渡さない。
  const text = maskInline(joinLines(lines, head === "" ? 0 : 1, collector.masker), collector.masker)
  if (!hasText(text)) {
    return
  }
  const segment = { id: collector.segments.length + 1, text }
  collector.segments.push(segment)
  collector.kinds.set(segment.id, kind)
  collector.ranges.push({ start, end, head, segment, original: collector.masked.slice(start, end) })
}

const offsets = (node: Nodes): readonly [start: number, end: number] | undefined => {
  const start = node.position?.start.offset
  const end = node.position?.end.offset
  return start === undefined || end === undefined ? undefined : [start, end]
}

const addHeading = (collector: Collector, node: Heading): void => {
  collector.headings.push(
    collector.masker.unmask(toString(node), (masked) => (masked.kind === "variable" ? masked.meaning : masked.original))
  )
  const range = offsets(node)
  if (range === undefined) {
    return
  }
  const [start, end] = range
  const source = collector.masked.slice(start, end)
  const atx = /^#{1,6}[ \t]+/.exec(source)
  if (atx === null) {
    // Setext見出しは、下線の行を残す。
    add(collector, start, start + source.split("\n").slice(0, -1).join("\n").length, "heading")
    return
  }
  // #の後ろから、閉じの#の手前までを差し替える。
  add(collector, start + atx[0].length, end - (/[ \t]+#+[ \t]*$/.exec(source)?.[0].length ?? 0), "heading")
}

const addCell = (collector: Collector, node: TableCell): void => {
  const range = offsets(node)
  if (range === undefined) {
    return
  }
  // セルの範囲には前後の|と空白が含まれるので除く。
  const [start, end] = range
  const raw = collector.masked.slice(start, end)
  const lead = /^\|?[ \t]*/.exec(raw)?.[0].length ?? 0
  const trail = /[ \t]*\|?[ \t]*$/.exec(raw.slice(lead))?.[0].length ?? 0
  if (raw.length - lead - trail > 0) {
    add(collector, start + lead, end - trail, "cell")
  }
}

// HTMLブロックは行ごとに訳す。行をつなぐとHTMLブロックの終わりが変わるため。
// <pre>や<script>の中はコードなので訳さない。引用の中の行は、行頭の>を除いて渡す。
const addHtml = (collector: Collector, node: Html): void => {
  const range = offsets(node)
  if (range === undefined) {
    return
  }
  let [offset] = range
  let inRaw = false
  for (const [index, line] of collector.masked.slice(range[0], range[1]).split("\n").entries()) {
    const prefix = index === 0 ? capture(/^[ \t]*/.exec(line), 0) : prefixOf(line)
    const content = line.slice(prefix.length)
    const opens = RAW_HTML_START.test(content)
    const closes = RAW_HTML_END.test(content)
    if (!inRaw && !opens && content.trim() !== "") {
      add(collector, offset + prefix.length, offset + line.trimEnd().length, "html")
    }
    inRaw = opens && !closes ? true : inRaw && !closes
    offset += line.length + 1
  }
}

const isBlockContainer = (node: Nodes): boolean => node.type === "root" || node.type === "listItem" || node.type === "blockquote"

// 訳す文を持たないブロック。中へは進まない。
const SKIPPED: ReadonlySet<string> = new Set(["code", "definition", "thematicBreak", "yaml"])

const walk = (collector: Collector, node: Nodes, parentIsBlockContainer: boolean): void => {
  if (node.type === "heading") {
    addHeading(collector, node)
  } else if (node.type === "paragraph") {
    const range = offsets(node)
    if (range !== undefined) {
      add(collector, range[0], range[1], "paragraph")
    }
  } else if (node.type === "tableCell") {
    addCell(collector, node)
  } else if (node.type === "html") {
    // 段落の中のHTML(行内のタグ)は、段落の断片に含まれている。
    if (parentIsBlockContainer) {
      addHtml(collector, node)
    }
  } else if (!SKIPPED.has(node.type) && "children" in node) {
    for (const child of node.children) {
      walk(collector, child, isBlockContainer(node))
    }
  }
}

/** 本文から、訳す断片と、それを差し込む範囲を取り出す。 */
export const prepare = (body: string, masker: Masker, options: MaskOptions): Prepared => {
  const masked = maskBlocks(body, masker, options)
  const collector: Collector = { masked, masker, ranges: [], segments: [], kinds: new Map(), headings: [] }
  walk(collector, parseMarkdown(masked), true)
  return collector
}

/** 訳文を差し込んで本文を組み立てる。訳が無い断片は原文のまま戻す。目印は戻さない。 */
export const assemble = (prepared: Prepared, translations: ReadonlyMap<number, string>): string => {
  let out = ""
  let position = 0
  for (const range of prepared.ranges.toSorted((left, right) => left.start - right.start)) {
    out += prepared.masked.slice(position, range.start - range.head.length) + range.head
    out += translations.get(range.segment.id) ?? range.original
    position = range.end
  }
  return out + prepared.masked.slice(position)
}
