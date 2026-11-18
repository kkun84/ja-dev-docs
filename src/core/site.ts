/**
 * サイトの表示のための純関数。訳文を表示用に整え、ページをまとめ、サイドバーと帰属表示を作る。
 */
import GithubSlugger from "github-slugger"
import { rewriteHtmlLinks, type LinkOrigin } from "./links.ts"
import { MODEL_ORDER } from "./model.ts"
import { splitFrontMatter } from "./page.ts"
import type { TranslationRecord } from "./record.ts"
import { capture } from "./text.ts"

const HOST_LABELS: ReadonlyMap<string, string> = new Map([
  ["code.visualstudio.com", "VS Code"],
  ["docs.github.com", "GitHub Docs"]
])

/** 読者に見せる、原文のサイトの名前。 */
export const hostLabel = (host: string): string => HOST_LABELS.get(host) ?? host

/** ページの場所から、原文のサイトのホスト名を取り出す。 */
export const hostOf = (id: string): string => id.split("/")[0] ?? ""

/** ページが属する節。VS Codeはdocs/agentsのように2階層、GitHub Docsはen/copilotのように2階層までで区切る。 */
export const sectionOf = (id: string): string => id.split("/").slice(0, 3).join("/")

/** 1ページの、モデルごとの訳の1つ。 */
export interface VariantLike {
  /** ページの場所。 */
  readonly page: string
  readonly record: Pick<TranslationRecord, "model" | "untranslated">
}

/** 1ページと、その訳。 */
export interface Page<V> {
  readonly id: string
  /** 既定の訳を先頭にした、モデルごとの訳。 */
  readonly variants: ReadonlyArray<V>
  readonly primary: V
}

const rank = (model: string): number => {
  const index = MODEL_ORDER.indexOf(model)
  return index === -1 ? MODEL_ORDER.length : index
}

/** 訳をページごとにまとめる。既定の訳は、訳せなかった断片が少ないものを選び、同じなら`MODEL_ORDER`の順。 */
export const groupPages = <V>(variants: ReadonlyArray<V>, describe: (variant: V) => VariantLike): ReadonlyArray<Page<V>> =>
  [...Map.groupBy(variants, (variant) => describe(variant).page)].flatMap(([id, group]) => {
    const sorted = group.toSorted((left, right) => {
      const [a, b] = [describe(left).record, describe(right).record]
      return a.untranslated.length - b.untranslated.length || rank(a.model) - rank(b.model)
    })
    const [primary] = sorted
    return primary === undefined ? [] : [{ id, variants: sorted, primary }]
  })

/** サイドバーの1項目。 */
export interface SidebarLink {
  readonly label: string
  readonly link: string
}

const MAX_SIDEBAR_ITEMS = 200

/**
 * サイドバー。同じ節のページだけを並べる。
 *
 * 全ページを並べると、1ページ足すたびに全ページのHTMLが変わり、サイトの大きさがページ数の2乗で増えるため。
 * 全ページの一覧は`/list/`に置く。
 */
export const sidebar = (
  pages: ReadonlyArray<{ readonly id: string; readonly title: string }>,
  current: string
): readonly [SidebarLink, { readonly label: string; readonly items: ReadonlyArray<SidebarLink> }] => {
  const section = sectionOf(current)
  const items = pages
    .filter((page) => sectionOf(page.id) === section)
    .toSorted((left, right) => left.id.localeCompare(right.id))
    .slice(0, MAX_SIDEBAR_ITEMS)
    .map((page) => ({ label: page.title, link: `/${page.id}/` }))
  return [
    { label: "訳したページの一覧", link: "/list/" },
    { label: `${hostLabel(hostOf(current))}: ${section.split("/").slice(1).join("/")}`, items }
  ]
}

const ASIDES: ReadonlyMap<string, readonly [variant: string, title: string]> = new Map([
  ["NOTE", ["note", "メモ"]],
  ["TIP", ["tip", "ヒント"]],
  ["IMPORTANT", ["note", "重要"]],
  ["WARNING", ["caution", "警告"]],
  ["CAUTION", ["danger", "注意"]]
])

const ALERT_LINE = /^([ \t]*)>[ \t]?\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*$/

/**
 * GitHubのアラート(`> [!NOTE]`)を、Starlightの補足と同じHTMLにする。リストの中の字下げにも対応する。
 * 中身はMarkdownのまま残すため、前後に空行を入れる。
 */
export const alertsToAsides = (markdown: string): string => {
  const lines = markdown.split("\n")
  const out: string[] = []
  let index = 0
  while (index < lines.length) {
    const line = lines[index] ?? ""
    const match = ALERT_LINE.exec(line)
    const aside = ASIDES.get(capture(match, 2))
    index += 1
    if (match === null || aside === undefined) {
      out.push(line)
    } else {
      const indent = capture(match, 1)
      const [variant, title] = aside
      out.push(
        `${indent}<aside aria-label="${title}" class="starlight-aside starlight-aside--${variant}"><p class="starlight-aside__title" aria-hidden="true">${title}</p><div class="starlight-aside__content">`,
        ""
      )
      // 引用が続く間の行を、>を除いて中身にする。
      while (lines[index]?.startsWith(`${indent}>`) === true) {
        out.push(indent + (lines[index] ?? "").slice(indent.length + 1).replace(/^[ \t]/, ""))
        index += 1
      }
      out.push("", `${indent}</div></aside>`)
    }
  }
  return out.join("\n")
}

const DISPLAY_LINE = /^(\w+):[ \t]+(.+)$/

const displayValue = (raw: string): string => {
  const value = raw.trim()
  if (!value.startsWith('"')) {
    return value.replace(/^'(.*)'$/, "$1").replaceAll("''", "'")
  }
  try {
    const parsed: unknown = JSON.parse(value)
    return typeof parsed === "string" ? parsed : value
  } catch {
    return value
  }
}

const displayFrontMatter = (front: string | undefined): ReadonlyMap<string, string> =>
  new Map(
    (front ?? "").split("\n").flatMap((line) => {
      const match = DISPLAY_LINE.exec(line)
      return match === null ? [] : [[capture(match, 1), displayValue(capture(match, 2))] as const]
    })
  )

// HTMLコメントを除く。除いた結果、前後がつながって新しいコメントの始まりができることがあるので、
// 変わらなくなるまで繰り返し、残ったコメントの始まりも除く。
const stripComments = (text: string): string => {
  let current = text
  let previous = ""
  while (current !== previous) {
    previous = current
    current = current.replaceAll(/<!--[\s\S]*?-->/g, "")
  }
  return current.replaceAll("<!--", "")
}

/** 表示するために整えた訳文。 */
export interface DisplayPage {
  readonly title: string | undefined
  readonly description: string | undefined
  /** 描画するMarkdown。フロントマターと、題名にした先頭の見出しは除いてある。 */
  readonly markdown: string
  /** 描画するMarkdownの見出しに対応する、原文の見出し。 */
  readonly headings: ReadonlyArray<string>
}

/**
 * 訳文を表示用に整える。
 *
 * 題名はフロントマターから取り、無ければ先頭の`#`の見出しを題名にして本文から除く。
 */
export const displayPage = (text: string, originalHeadings: ReadonlyArray<string>): DisplayPage => {
  const { front, body } = splitFrontMatter(text)
  const fields = displayFrontMatter(front)
  const h1 = /^\s*# (.+)\n/.exec(body)
  const markdown = h1 === null ? body : body.slice(h1[0].length)
  return {
    title: fields.get("title") ?? fields.get("PageTitle") ?? (h1 === null ? undefined : stripComments(capture(h1, 1)).trim()),
    description: fields.get("intro") ?? fields.get("MetaDescription"),
    markdown: alertsToAsides(markdown),
    headings: h1 === null ? originalHeadings : originalHeadings.slice(1)
  }
}

/**
 * 見出しのIDを、訳した見出しではなく原文の見出しから作る。原文のIDを指すリンクが切れないように。
 *
 * 書き換えたHTMLと、書き換える前のIDから後のIDへの対応を返す。目次のIDも、この対応で直す。
 */
export const fixHeadingIds = (
  html: string,
  originalHeadings: ReadonlyArray<string>
): { readonly html: string; readonly renamed: ReadonlyMap<string, string> } => {
  const slugger = new GithubSlugger()
  const ids = originalHeadings.map((heading) => slugger.slug(heading))
  const renamed = new Map<string, string>()
  let index = 0
  const fixed = html.replaceAll(/<h([1-6])([^>]*?) id="([^"]*)"/g, (all, level: string, attributes: string, id: string) => {
    const next = ids[index]
    index += 1
    if (next === undefined || next === "") {
      return all
    }
    renamed.set(id, next)
    return `<h${level}${attributes} id="${next}"`
  })
  return { html: fixed, renamed }
}

/**
 * 見出しの`id`を`data-id`に退避する。
 *
 * 1ページのHTMLに全モデルの訳を入れるので、既定以外の訳の見出しのIDは重複する。切り替えたときにスクリプトで入れ替える。
 */
export const stashHeadingIds = (html: string): string => html.replaceAll(/(<h[1-6][^>]*?) id="/g, '$1 data-id="')

/** 帰属表示に出す、原文のライセンス。 */
export interface License {
  readonly name: string
  readonly url: string
  readonly author: string
}

const GITHUB_LICENSE: License = {
  name: "CC BY 4.0",
  url: "https://creativecommons.org/licenses/by/4.0/",
  author: "GitHub, Inc. and contributors"
}
const VSCODE_LICENSE: License = {
  name: "CC BY 3.0 US",
  url: "https://creativecommons.org/licenses/by/3.0/us/",
  author: "Microsoft Corporation and contributors"
}

/** 原文のURLから、帰属表示に出すライセンスを決める。 */
export const licenseOf = (url: string): License => (URL.parse(url)?.hostname === "docs.github.com" ? GITHUB_LICENSE : VSCODE_LICENSE)

/** 原文のコミットの時点の、原文のファイルのURL。コミットが分からなければ`undefined`。 */
export const sourceFileUrl = (record: Pick<TranslationRecord, "repo" | "file" | "commit">): string | undefined =>
  record.commit === undefined ? undefined : `https://github.com/${record.repo}/blob/${record.commit}/${record.file}`

/** 開き方の説明に載せるブックマークレット。原文のページで押すと、このサイトの日本語訳を開く。 */
export const bookmarklet = (site: string): string => `javascript:location.href='${site}/'+location.href.replace(/^https?:\\/\\//,'')`

/** 描画したHTMLの目次の1項目。 */
export interface RenderedHeading {
  readonly depth: number
  readonly slug: string
  readonly text: string
}

/**
 * 描画した訳文のHTMLを仕上げる。リンクを書き換え、見出しのIDを原文の見出しから作ったIDにし、目次のIDも合わせる。
 */
export const finishRendered = (
  rendered: { readonly html: string; readonly headings: ReadonlyArray<RenderedHeading> },
  origin: LinkOrigin,
  originalHeadings: ReadonlyArray<string>,
  translated: ReadonlySet<string>
): { readonly html: string; readonly headings: ReadonlyArray<RenderedHeading> } => {
  const { html, renamed } = fixHeadingIds(rewriteHtmlLinks(rendered.html, origin, translated), originalHeadings)
  return { html, headings: rendered.headings.map((heading) => ({ ...heading, slug: renamed.get(heading.slug) ?? heading.slug })) }
}
