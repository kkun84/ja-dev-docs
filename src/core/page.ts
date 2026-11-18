/**
 * 1ページの翻訳のうち、モデルを呼ばない部分。骨組みを取り出し、訳を検査し、組み立てる。
 *
 * モデルを呼ぶ順番と訳し直しは`services`が決める。ここは、渡された訳を採るかどうかと、採った訳の差し込みだけを行う。
 */
import { parse as parseYaml } from "yaml"
import { segmentErrors, tidy, type SegmentError } from "./check.ts"
import { Masker, tokenIds, type Masked } from "./mask.ts"
import {
  assemble,
  hasText,
  maskBlocks,
  maskInline,
  prepare,
  type Keybinding,
  type MaskOptions,
  type Prepared,
  type Segment,
  type SegmentKind
} from "./segment.ts"
import { capture } from "./text.ts"

// フロントマターのうち、訳すキー。
const FRONT_MATTER_KEYS: ReadonlySet<string> = new Set(["title", "shortTitle", "intro", "PageTitle", "MetaDescription"])
const FRONT_MATTER = /^---\n([\s\S]*?)\n---\n/
const FRONT_MATTER_LINE = /^(\w+):[ \t]+(.+)$/

export interface PlanOptions extends MaskOptions {
  /** 目印のIDを決める種。同じ原文と種からは、同じ目印ができる。 */
  readonly seed: string
}

/** 1ページの翻訳の計画。訳す断片と、訳を差し込む先。 */
export interface PagePlan {
  readonly masker: Masker
  readonly body: Prepared
  /** 原文に本文の末尾の改行があったか。 */
  readonly endsWithNewline: boolean
  /** フロントマターの行。フロントマターが無ければ`undefined`。 */
  readonly frontLines: ReadonlyArray<string> | undefined
  /** フロントマターの行の番号と、その行の値の断片。 */
  readonly frontSegments: ReadonlyMap<number, Segment>
  /** 本文とフロントマターの、すべての断片。 */
  readonly segments: ReadonlyArray<Segment>
  readonly kinds: ReadonlyMap<number, SegmentKind>
}

/** フロントマターと本文に分ける。 */
export const splitFrontMatter = (text: string): { readonly front: string | undefined; readonly body: string } => {
  const match = FRONT_MATTER.exec(text)
  return match === null ? { front: undefined, body: text } : { front: capture(match, 1), body: text.slice(match[0].length) }
}

const quotedScalar = (value: string): string | undefined => {
  try {
    const parsed: unknown = parseYaml(`v: ${value}`)
    const scalar = typeof parsed === "object" && parsed !== null && "v" in parsed ? parsed.v : undefined
    return typeof scalar === "string" ? scalar : undefined
  } catch {
    return undefined
  }
}

// YAMLの1行の値を読む。引用符で囲まれていればYAMLとして解釈し、囲まれていなければそのまま使う。
const scalar = (raw: string): string | undefined => {
  const value = raw.trim()
  if (/^['"]/.test(value)) {
    return quotedScalar(value)
  }
  // ブロックの記法、アンカー、タグ、配列やオブジェクトは、1行の文字列ではない。
  return /^[|>&*![{]/.test(value) ? undefined : value.replace(/\s+#.*$/, "")
}

/** 原文から、訳す断片と、訳を差し込む先を取り出す。 */
export const planPage = (text: string, options: PlanOptions): PagePlan => {
  const masker = new Masker(options.seed)
  const { front, body } = splitFrontMatter(text)
  const prepared = prepare(body, masker, options)
  const segments = [...prepared.segments]
  const kinds = new Map(prepared.kinds)
  const frontSegments = new Map<number, Segment>()
  // フロントマターはLiquidを含み、厳密なYAMLでないことがあるので、1行の「キー: 値」だけを行単位で扱う。
  const frontLines = front?.split("\n")
  for (const [index, line] of (frontLines ?? []).entries()) {
    const match = FRONT_MATTER_LINE.exec(line)
    const value = match !== null && FRONT_MATTER_KEYS.has(capture(match, 1)) ? scalar(capture(match, 2)) : undefined
    const masked = value === undefined ? "" : maskInline(maskBlocks(value, masker, options), masker)
    if (hasText(masked)) {
      const segment = { id: segments.length + 1, text: masked }
      segments.push(segment)
      kinds.set(segment.id, "front")
      frontSegments.set(index, segment)
    }
  }
  return { masker, body: prepared, endsWithNewline: body.endsWith("\n"), frontLines, frontSegments, segments, kinds }
}

/** モデルに渡す、目印と中身の対応表。渡す断片に含まれる目印だけを入れる。 */
export const legendFor = (plan: PagePlan, segments: ReadonlyArray<Segment>): Readonly<Record<string, string>> =>
  Object.fromEntries(segments.flatMap((segment) => tokenIds(segment.text)).map((id) => [id, plan.masker.get(id)?.meaning ?? ""]))

/** 断片の訳を採らなかった理由。 */
export interface FailedSegment {
  readonly id: number
  readonly errors: ReadonlyArray<SegmentError>
}

/** モデルの出力のうち、採った訳と、採らなかった断片。 */
export interface Verdict {
  readonly accepted: ReadonlyMap<number, string>
  readonly failed: ReadonlyArray<FailedSegment>
}

const bareUrls = (plan: PagePlan, text: string): ReadonlySet<string> =>
  new Set(tokenIds(text).filter((id) => plan.masker.get(id)?.kind === "bareurl"))

/** モデルが返した訳を、目印の書き間違いと空白を直してから検査し、採るものと採らないものに分ける。 */
export const judge = (plan: PagePlan, sent: ReadonlyArray<Segment>, output: ReadonlyMap<number, string>): Verdict => {
  const accepted = new Map<number, string>()
  const failed: FailedSegment[] = []
  for (const segment of sent) {
    const raw = output.get(segment.id)
    const text = raw === undefined ? undefined : tidy(plan.masker.repair(raw), bareUrls(plan, segment.text))
    const errors = segmentErrors(segment.text, text, plan.kinds.get(segment.id))
    if (text !== undefined && errors.length === 0) {
      accepted.set(segment.id, text)
    } else {
      failed.push({ id: segment.id, errors })
    }
  }
  return { accepted, failed }
}

export interface RenderOptions {
  /** 変数ごとの訳語。書いていない変数は値(英語)のまま。 */
  readonly glossary: Readonly<Record<string, string>>
  readonly keybinding?: ((command: string) => Keybinding | undefined) | undefined
}

const renderKeybinding = (masked: Masked, options: RenderOptions): string => {
  const command = capture(/kb\(([\w.-]+)\)/.exec(masked.original), 1)
  const keys = options.keybinding?.(command)
  return keys === undefined ? `\`${command}\`` : `<kbd title="macOS: ${keys.mac}">${keys.win}</kbd>`
}

const renderMasked =
  (options: RenderOptions) =>
  (masked: Masked): string => {
    if (masked.kind === "kbd") {
      return renderKeybinding(masked, options)
    }
    if (masked.kind !== "variable") {
      return masked.original
    }
    const path = capture(/variables\.([\w.-]+)/.exec(masked.original), 1)
    return options.glossary[path] ?? masked.meaning
  }

/** 採った訳を差し込み、目印を戻して、訳文のMarkdownを組み立てる。訳が無い断片は原文のまま残す。 */
export const renderPage = (plan: PagePlan, translations: ReadonlyMap<number, string>, options: RenderOptions): string => {
  const render = renderMasked(options)
  const body = plan.masker.unmask(assemble(plan.body, translations), render)
  const lines = plan.frontLines?.map((line, index) => {
    const translated = translations.get(plan.frontSegments.get(index)?.id ?? 0)
    return translated === undefined
      ? line
      : line.replace(/^(\w+):.*$/, (_all, key: string) => `${key}: ${JSON.stringify(plan.masker.unmask(translated, render))}`)
  })
  const front = lines === undefined ? "" : `---\n${lines.join("\n")}\n---\n`
  return front + body + (plan.endsWithNewline && !body.endsWith("\n") ? "\n" : "")
}

/** 訳せずに原文のまま残した断片の番号。 */
export const untranslatedIds = (plan: PagePlan, translations: ReadonlyMap<number, string>): ReadonlyArray<number> =>
  plan.segments.filter((segment) => !translations.has(segment.id)).map((segment) => segment.id)

const LIQUID_TAG = /\{%-?\s*(\w+)[^%\n]*%\}/g
// 訳すときに目印にするタグ。展開できずに残ったものには数えない。
const EXPECTED_TAGS: ReadonlySet<string> = new Set(["data", "raw", "endraw"])

/** 展開できずに原文に残ったLiquidのタグの名前。表示が崩れる原因になるので、記録に残す。 */
export const unresolvedLiquid = (text: string): ReadonlyArray<string> => [
  ...new Set([...text.matchAll(LIQUID_TAG)].map((match) => capture(match, 1)).filter((tag) => !EXPECTED_TAGS.has(tag)))
]
