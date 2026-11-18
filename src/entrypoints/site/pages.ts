// Astroのページから使う、訳文のコレクションの読み方。Astroのページには表示だけを書き、計算はここを通してsrc/coreに任せる。
import { modelLabel } from "../../core/model.ts"
import type { TranslationRecord } from "../../core/record.ts"
import {
  bookmarklet,
  groupPages,
  hostLabel,
  hostOf,
  licenseOf,
  sidebar,
  sourceFileUrl,
  stashHeadingIds,
  type License,
  type Page,
  type RenderedHeading
} from "../../core/site.ts"

/** 訳文のコレクションの1件のデータ。ローダーが入れる。 */
export interface VariantData {
  /** ページの場所。 */
  readonly page: string
  readonly title: string
  readonly description: string | undefined
  readonly record: TranslationRecord
}

/** 訳文のコレクションの1件。Astroの`getCollection("translations")`が返すもののうち、使う部分。 */
export interface Variant {
  readonly data: VariantData
  readonly rendered?: { readonly html: string; readonly metadata?: { readonly headings?: ReadonlyArray<RenderedHeading> } }
}

export type SitePage = Page<Variant>

/** コレクションの訳を、ページごとにまとめる。 */
export const toPages = (variants: ReadonlyArray<Variant>): ReadonlyArray<SitePage> => groupPages(variants, (variant) => variant.data)

/** 場所の順に並べた、原文のサイトごとのページの一覧。 */
export const pagesByHost = (
  pages: ReadonlyArray<SitePage>
): ReadonlyArray<{ readonly label: string; readonly pages: ReadonlyArray<SitePage> }> =>
  [
    ...Map.groupBy(
      pages.toSorted((left, right) => left.id.localeCompare(right.id)),
      (page) => hostOf(page.id)
    )
  ].map(([host, grouped]) => ({
    label: hostLabel(host),
    pages: grouped
  }))

/** ページのサイドバー。同じ節の訳したページだけを並べる。 */
export const sidebarFor = (pages: ReadonlyArray<SitePage>, current: string): ReturnType<typeof sidebar> =>
  sidebar(
    pages.map((page) => ({ id: page.id, title: page.primary.data.title })),
    current
  )

/** 訳のHTML。既定以外の訳は、見出しのIDが重複しないよう`data-id`に退避する。切り替えたときにスクリプトで入れ替える。 */
export const variantHtml = (variant: Variant, isPrimary: boolean): string => {
  const html = variant.rendered?.html ?? ""
  return isPrimary ? html : stashHeadingIds(html)
}

/** 帰属表示に出す内容。 */
export interface Attribution {
  readonly url: string
  readonly license: License
  readonly model: string
  /** 訳した日。 */
  readonly date: string
  readonly commit: { readonly short: string; readonly url: string } | undefined
}

const SHORT_COMMIT_LENGTH = 7
const DATE_LENGTH = 10

export const attributionOf = ({ record }: VariantData): Attribution => {
  const url = sourceFileUrl(record)
  return {
    url: record.url,
    license: licenseOf(record.url),
    model: modelLabel(record.model),
    date: record.translatedAt.slice(0, DATE_LENGTH),
    commit: record.commit === undefined || url === undefined ? undefined : { short: record.commit.slice(0, SHORT_COMMIT_LENGTH), url }
  }
}

/** 開き方の説明に出す、サイトのURLから作る値。 */
export const usageOf = (origin: string): { readonly site: string; readonly host: string; readonly bookmarklet: string } => {
  const site = origin.replace(/\/$/, "")
  return { site, host: new URL(site).host, bookmarklet: bookmarklet(site) }
}

/** 読者に見せるモデルの名前。 */
export const modelName = (model: string): string => modelLabel(model)
