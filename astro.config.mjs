// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import remarkCjkFriendly from "remark-cjk-friendly";

// サイトは静的に出力する。訳が無いページとAPIは、Astroとは別の小さなWorker(worker/index.ts)が扱う。
export default defineConfig({
  site: process.env.SITE_URL ?? "https://ja.keke.works",
  markdown: {
    // 日本語に隣接した ** や _ も強調として扱う。
    remarkPlugins: [remarkCjkFriendly],
  },
  integrations: [
    starlight({
      title: "開発者ドキュメント日本語訳(非公式)",
      defaultLocale: "root",
      locales: { root: { label: "日本語", lang: "ja" } },
      social: [{ icon: "github", label: "GitHub", href: "https://github.com/kkun84/ja-dev-docs" }],
      pagefind: true,
      customCss: ["./src/styles/sites.css"],
      components: { Header: "./src/components/Header.astro" },
    }),
  ],
});
