// content/の訳文を読み、ページごとのモデル別の訳としてAstroのコレクションに入れる。
import type { Loader } from "astro/loaders"
import { Effect } from "effect"
import { finishRendered } from "../../core/site.ts"
import { loadTranslations } from "../../services/site.ts"
import { storeLayer } from "../node/runtime.ts"
import type { VariantData } from "./pages.ts"

/** 訳文のコレクションのローダー。訳文をHTMLに描画し、リンクと見出しのIDを仕上げて入れる。 */
export const translationsLoader = (): Loader => ({
  name: "translations",
  load: async (context) => {
    context.store.clear()
    const translations = await Effect.runPromise(loadTranslations().pipe(Effect.provide(storeLayer)))
    const pages = new Set(translations.map((translation) => translation.page))
    await Promise.all(
      translations.map(async ({ page, record, display }) => {
        const rendered = await context.renderMarkdown(display.markdown)
        const finished = finishRendered(
          { html: rendered.html, headings: rendered.metadata?.headings ?? [] },
          record,
          display.headings,
          pages
        )
        const data: VariantData = { page, title: display.title ?? page, description: display.description, record }
        context.store.set({
          id: `${page}/${record.model}`,
          data: { ...data },
          rendered: { ...rendered, html: finished.html, metadata: { ...rendered.metadata, headings: [...finished.headings] } }
        })
      })
    )
    context.logger.info(`${translations.length} translations of ${pages.size} pages`)
  }
})
