// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import cloudflare from "@astrojs/cloudflare";
import remarkCjkFriendly from "remark-cjk-friendly";

export default defineConfig({
  site: process.env.SITE_URL ?? "https://ja.keke.works",
  // 画像の変換はしない(Cloudflare Imagesを使わない)。ビルド時の事前描画はNodeで行う(読み込み処理がファイルを読むため)。
  adapter: cloudflare({ imageService: "passthrough", prerenderEnvironment: "node" }),
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
    }),
  ],
});
