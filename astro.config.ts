import { unified } from "@astrojs/markdown-remark"
import starlight from "@astrojs/starlight"
import { defineConfig } from "astro/config"
import remarkCjkFriendly from "remark-cjk-friendly"

// サイトは静的に出力する。訳が無いページとAPIは、Astroとは別の小さなWorker(src/entrypoints/worker)が扱う。
export default defineConfig({
  site: process.env["SITE_URL"] ?? "https://ja.keke.works",
  // Astroのページと部品はsite/に置く。src/は層に分けたTypeScriptだけにする。
  srcDir: "./site",
  markdown: {
    // 日本語に隣接した**や_も強調として扱う。
    processor: unified({ remarkPlugins: [remarkCjkFriendly] })
  },
  integrations: [
    starlight({
      title: "開発者ドキュメント日本語訳(非公式)",
      defaultLocale: "root",
      locales: { root: { label: "日本語", lang: "ja" } },
      social: [{ icon: "github", label: "GitHub", href: "https://github.com/kkun84/ja-dev-docs" }],
      pagefind: true
    })
  ]
})
