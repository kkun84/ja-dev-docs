/**
 * GitHub Docsの原文にあるLiquidのうち、訳す前に決められるものを展開する。
 *
 * 読者が見るのはgithub.comの版(fpt)なので、`{% ifversion %}`はその版で評価する。
 * `{% data reusables.… %}`は本文に埋め込み、ページ全体を同じ文脈で訳せるようにする。
 * `[AUTOTITLE](/path)`は、リンク先の題名に置き換える。題名も一緒に訳される。
 * `{% octicon %}`はアイコンなので除く。`{% data variables.… %}`は残し、訳すときに目印にする。
 *
 * 展開には原文のリポジトリの別のファイルが要る。ここでは取得せず、手元の`LiquidData`だけで展開し、
 * 足りなかったものを`needs`で返す。呼ぶ側は、足りないものを取得して、`needs`が空になるまで呼び直す。
 */
import { parse as parseYaml } from "yaml"
import { capture } from "./text.ts"

/** 展開に使う、原文のリポジトリから取得済みの値。キーがあって値が`undefined`なら、原文に無いことが分かっている。 */
export interface LiquidData {
  /** `data/features/`の機能の名前が、読者の版(fpt)で有効か。 */
  readonly features: ReadonlyMap<string, boolean>
  /** `data/reusables/`からの相対パス(拡張子なし)と、その本文。 */
  readonly reusables: ReadonlyMap<string, string | undefined>
  /** リンク先のパスと、そのページの題名。 */
  readonly titles: ReadonlyMap<string, string | undefined>
}

/** 展開に足りなかった値のキー。 */
export interface LiquidNeeds {
  readonly features: ReadonlySet<string>
  readonly reusables: ReadonlySet<string>
  readonly titles: ReadonlySet<string>
}

interface Context {
  readonly data: LiquidData
  readonly needs: { readonly features: Set<string>; readonly reusables: Set<string>; readonly titles: Set<string> }
}

const MAX_DEPTH = 5
const MAX_IF_BLOCKS = 1000

const TOOL_LABELS: ReadonlyMap<string, string> = new Map([
  ["webui", "Web UI"],
  ["cli", "GitHub CLI"],
  ["desktop", "GitHub Desktop"],
  ["curl", "curl"],
  ["codespaces", "Codespaces"],
  ["vscode", "Visual Studio Code"],
  ["visualstudio", "Visual Studio"],
  ["jetbrains", "JetBrains IDEs"],
  ["xcode", "Xcode"],
  ["eclipse", "Eclipse"],
  ["mac", "Mac"],
  ["windows", "Windows"],
  ["linux", "Linux"],
  ["javascript", "JavaScript"],
  ["bash", "Bash"],
  ["powershell", "PowerShell"],
  ["api", "API"]
])

// 表示に関わらない囲みのタグ。
const DROP_TAGS: ReadonlySet<string> = new Set(["note", "tip", "warning", "danger", "caution", "rowheaders", "comment"])

// 読者の版(fpt)で決まっている版の名前。それ以外の名前は、data/features/の機能として引く。
const VERSIONS: ReadonlyMap<string, boolean> = new Map([
  ["fpt", true],
  ["ghec", false],
  ["ghes", false]
])

const isEnabled = (name: string, context: Context): boolean => {
  const known = VERSIONS.get(name) ?? context.data.features.get(name)
  if (known === undefined) {
    context.needs.features.add(name)
    return false
  }
  return known
}

// 比較つきの条件(ghes > 3.10など)はghesのときだけ意味を持つ。fptではghesが無効なので、名前だけで判定する。
const TERM = /^(not\s+)?([\w.-]+)(?:\s*(?:<=|>=|<|>|=|!=)\s*[\d.]+)?$/

const evaluateTerm = (term: string, context: Context): boolean => {
  const match = TERM.exec(term.trim())
  const name = match?.[2]
  if (match === null || name === undefined) {
    return false
  }
  return isEnabled(name, context) !== (match[1] !== undefined)
}

const evaluate = (condition: string, context: Context): boolean =>
  condition.split(/\s+or\s+/).some((alternative) => alternative.split(/\s+and\s+/).every((term) => evaluateTerm(term, context)))

const IF_TAG = /\{%-?\s*(ifversion|elsif|else|endif)\b([^%]*?)-?%\}/g

// いちばん内側の、ifversionからendifまでのタグの並び。
const innermostBlock = (text: string): ReadonlyArray<RegExpExecArray> | undefined => {
  const tags = [...text.matchAll(IF_TAG)]
  let start = -1
  for (const [index, tag] of tags.entries()) {
    if (tag[1] === "ifversion") {
      start = index
    } else if (tag[1] === "endif" && start !== -1) {
      return tags.slice(start, index + 1)
    }
  }
  return undefined
}

const chooseBranch = (text: string, block: ReadonlyArray<RegExpExecArray>, context: Context): string => {
  for (const [index, tag] of block.slice(0, -1).entries()) {
    if (tag[1] === "else" || evaluate((tag[2] ?? "").trim(), context)) {
      return text.slice(tag.index + tag[0].length, block[index + 1]?.index)
    }
  }
  return ""
}

// 内側のifversionから順に評価し、選んだ枝の中身に置き換える。
const evaluateIfs = (text: string, context: Context): string => {
  let current = text
  for (let guard = 0; guard < MAX_IF_BLOCKS; guard += 1) {
    const block = innermostBlock(current)
    const first = block?.[0]
    const last = block?.at(-1)
    if (block === undefined || first === undefined || last === undefined) {
      return current
    }
    current = current.slice(0, first.index) + chooseBranch(current, block, context) + current.slice(last.index + last[0].length)
  }
  return current
}

// 複数行の部品の2行目以降の頭に付けるもの。字下げ、引用の>、リストの記号の幅を合わせる。
const continuationPad = (before: string): string => {
  const match = /^((?:[ \t]*>[ \t]?)*)([ \t]*)((?:[-*+]|\d+[.)])[ \t]+)?/.exec(before)
  return capture(match, 1) + capture(match, 2) + " ".repeat(match?.[3]?.length ?? 0)
}

const REUSABLE = /\{%-?\s*data\s+reusables\.([\w.\-/]+)\s*-?%\}/g

// 再利用部品は、行のどこにあっても展開する。複数行の部品は、埋め込む位置の字下げ、リストの記号の幅、引用の>に合わせる。
// 部品の中の部品は、部品を展開するときの再帰で展開する。
const expandReusables = (text: string, context: Context, depth: number): string =>
  text.replaceAll(REUSABLE, (all, dotted: string, offset: number, whole: string) => {
    const path = dotted.replaceAll(".", "/")
    if (depth >= MAX_DEPTH) {
      return all
    }
    if (!context.data.reusables.has(path)) {
      context.needs.reusables.add(path)
      return all
    }
    const body = context.data.reusables.get(path)
    if (body === undefined) {
      return all
    }
    const pad = continuationPad(whole.slice(whole.lastIndexOf("\n", offset - 1) + 1, offset))
    return expand(body, context, depth + 1)
      .replace(/\n+$/, "")
      .split("\n")
      .map((line, index) => (index === 0 ? line : line === "" ? pad.trimEnd() : pad + line))
      .join("\n")
  })

// アイコンの直後に名前の文字が続く(「{% octicon %} Agents」)ときは、アイコンを除く。
// 名前が続かない(「Click {% octicon %}, then」)ときは、アイコンが唯一の目的語なので、説明(aria-label)の文字にする。
// 除くときは、前後の両方に空白があれば1つ残し、片方だけなら残さない(**{% octicon %} Agents**が** Agents**にならないように)。
const replaceOcticons = (text: string): string =>
  text.replaceAll(
    /([ \t]?)\{%-?\s*octicon\s([^%]*?)-?%\}([ \t]?)(?=(.?))/g,
    (_all, before: string, args: string, after: string, next: string) => {
      const label = /aria-label="([^"]+)"/.exec(args)?.[1]
      if (label !== undefined && !/[A-Za-z0-9*_`]/.test(next)) {
        return `${before}${label}${after}`
      }
      return before !== "" && after !== "" ? " " : ""
    }
  )

const replaceTags = (text: string): string =>
  text
    // ツールごとの手順の切り替え({% webui %}など)は、ツール名の見出しにして全部を並べる。
    .replaceAll(/^([ \t]*)\{%-?\s*(\w+)\s*-?%\}[ \t]*$/gm, (all, indent: string, tag: string) => {
      const label = TOOL_LABELS.get(tag)
      return label === undefined ? all : `${indent}**${label}**`
    })
    .replaceAll(/[ \t]*\{%-?\s*end(\w+)\s*-?%\}/g, (all, tag: string) => (TOOL_LABELS.has(tag) || DROP_TAGS.has(tag) ? "" : all))
    .replaceAll(/[ \t]*\{%-?\s*(\w+)\s*-?%\}/g, (all, tag: string) => (DROP_TAGS.has(tag) ? "" : all))

const replaceAutotitles = (text: string, context: Context): string =>
  text.replaceAll(/\[AUTOTITLE\]\(([^)\s#]+)(#[^)\s]*)?\)/g, (all, path: string, anchor: string | undefined) => {
    if (!context.data.titles.has(path)) {
      context.needs.titles.add(path)
      return all
    }
    const title = context.data.titles.get(path)
    return title === undefined ? all : `[${title}](${path}${anchor ?? ""})`
  })

// {%-と-%}の空白除去。Liquidと同じく、前(後ろ)の改行を含む空白を除く。表の行の間に条件分岐を書く形で使われる。
const trimWhitespaceControl = (text: string): string => text.replaceAll(/\s*(\{%-)/g, "$1").replaceAll(/(-%\})\s*/g, "$1")

const RAW_BLOCK = /\{%-?\s*raw\s*-?%\}([\s\S]*?)\{%-?\s*endraw\s*-?%\}/g
const RAW_MARK = "\u0000"

function expand(text: string, context: Context, depth: number): string {
  // {% raw %}の中は展開しない。
  const raws: string[] = []
  const protectedText = text.replaceAll(RAW_BLOCK, (_all, inner: string) => `${RAW_MARK}RAW${raws.push(inner) - 1}${RAW_MARK}`)
  const expanded = replaceAutotitles(
    replaceTags(replaceOcticons(evaluateIfs(expandReusables(trimWhitespaceControl(protectedText), context, depth), context))),
    context
  )
  return expanded.replaceAll(new RegExp(`${RAW_MARK}RAW(\\d+)${RAW_MARK}`, "g"), (_all, index: string) => raws[Number(index)] ?? "")
}

/** 手元の値でLiquidを展開する。足りなかった値は`needs`に入れ、その部分は展開せずに残す。 */
export const expandLiquid = (text: string, data: LiquidData): { readonly text: string; readonly needs: LiquidNeeds } => {
  const context: Context = { data, needs: { features: new Set(), reusables: new Set(), titles: new Set() } }
  return { text: expand(text, context, 0), needs: context.needs }
}

/** 足りない値がもう無いか。 */
export const isSatisfied = (needs: LiquidNeeds): boolean => needs.features.size + needs.reusables.size + needs.titles.size === 0

const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> => typeof value === "object" && value !== null

/** `data/features/<名前>.yml`の中身から、その機能が読者の版(fpt)で有効かを決める。ファイルが無ければ無効。 */
export const featureEnabled = (yaml: string | undefined): boolean => {
  if (yaml === undefined) {
    return false
  }
  const parsed: unknown = parseYaml(yaml)
  const versions = isRecord(parsed) ? parsed["versions"] : undefined
  return isRecord(versions) && "fpt" in versions
}

/** 原文のMarkdownのフロントマターから、題名を取り出す。 */
export const frontMatterTitle = (markdown: string): string | undefined =>
  /^title:[ \t]*(.+)$/m
    .exec(markdown)?.[1]
    ?.trim()
    .replace(/^(['"])(.*)\1$/, "$2")
