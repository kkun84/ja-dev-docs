# 静的サイトジェネレーターの比較（案）

公開サイトをCloudflare Pagesに載せる前提で、静的サイトジェネレーター（SSG）を比べた案です。採否は決めていません。サイトの実装は、この文書の対象外です。

この文書の作成日は2026年11月11日（Asia/Tokyo）です。仕様や制限は公式の文書で確認し、ビルド時間など公式に無い数字は、出典の日付と条件を添えています。確認できなかったことは、その旨を書き、推測では埋めません。

比べる対象は、AstroのStarlight、Docusaurus、VitePress、Hugo、Eleventy、MkDocs Materialの6つです。公開先をCloudflare Pagesにすることは、既に決まっています。原文の構成を写すこと、GitHub DocsのLiquid（`{% data %}`、`{% ifversion %}`、reusables、`AUTOTITLE`）を扱えること、日本語の検索ができることは、選定の条件です。

## 目次

- [選定の条件](#選定の条件)
- [Liquidの扱い](#liquidの扱い)
- [候補の比較](#候補の比較)
- [ビルド時間](#ビルド時間)
- [日本語の検索](#日本語の検索)
- [案としての推奨](#案としての推奨)
- [未決事項](#未決事項)
- [出典](#出典)

## 選定の条件

サイトの置き方と、URLの形は、[サイト構成案](site-structure.md)に従います。SSGを選ぶときに見る条件は、次のとおりです。

1. **Cloudflare Pagesでビルドし、公開できること。** 無料プランのビルド制限は、同時1本、タイムアウト20分です。1デプロイあたりのファイル数は2万が上限です。
2. **原文の構成とURLを写せること。** 公開パスは、GitHub Docsを`/github/`、VS Code docsを`/vscode/`の下に置きます。第2フェーズ以降は、`/github/enterprise-cloud@latest/...`のようなバージョン付きURLも必要になります。
3. **GitHub DocsのLiquidを扱えること。** 訳文のソースには、Liquidを原文のまま残します。展開はビルド時に行います。標準のLiquidには無いタグ（`{% data %}`、`{% ifversion %}`、`AUTOTITLE`、`{% octicon %}`など）があります。
4. **日本語の全文検索ができること。** 空白で区切られない語を、読者が検索できる必要があります。初版の20ページでは簡易な目次だけでも足りますが、第2フェーズ以降を見据えて比べます。
5. **1万ページ前後でも、20分の制限に収まる見込みがあること。** 第2フェーズの目安は、GitHub Docsのfpt（またはfptとghec）と、現行のVS Code docsを合わせた規模です。GitHub Docsを全バージョンで出すと、HTMLだけでも約15,910ページになります。

フロントマターの形は、上流と、各SSGの既定で違います。どの候補を採っても、ビルドの前にキーを揃える処理は必要です。これは優劣というより、共通の作業です。

## Liquidの扱い

結論から書きます。ここに挙げた6つのうち、GitHub Docsの独自タグを、そのまま理解して展開できるものはありません。EleventyはテンプレートにLiquidを使えますが、使えるのは標準のLiquid（[liquidjs](https://www.11ty.dev/docs/languages/liquid/)）です。`{% data reusables.* %}`や`{% ifversion fpt or ghec %}`は、GitHub Docsが独自に足しているタグです。

取りうる道は、次の2つです。

**ビルドの前に、自分たちで展開する。** 訳文のソースにはLiquidを残し、SSGへ渡す直前に、バージョンごとの本文へ展開します。どのSSGでも使えます。この文書では、これを前展開と呼びます。`AUTOTITLE`や内部リンクの解決も、同じ段階に載せられます。VitePressやDocusaurusは、残った`{{ }}`や`{% %}`が、VueやMDXの構文と衝突することがあります。前もって展開しておく方が安全です。

**SSGの中で、独自タグを実装する。** 現実的なのはEleventyです。liquidjsへ、`data`や`ifversion`などのカスタムタグを足せます。GitHub Docsの方言を、必要な範囲で再実装する作業になります。公式サイトのレンダラをフォークする必要はありません。ただし、公式と同じ動きを自分たちで再現する責任は残ります。

VS Code docsにも、`{% data variables.product.* %}`や、タブ用のタグがあります。分量はGitHub Docsより少ないですが、同じ方針で扱う必要があります。調査時点の`docs/`だけでも、`{% data variables.product.prodname_vscode_shortname %}`は4,000回を超えます。

この文書では、前展開を基本の案とします。Eleventyにだけ、「タグを中で実装する」選択肢が残ります。どちらを採るかは、SSGの決定と一緒に決めることになります。

## 候補の比較

Cloudflare Pagesは、Astro、Docusaurus、VitePress、Hugo、Eleventy、MkDocsに、公式のフレームワークプリセットを用意しています。StarlightはAstroのドキュメント用テーマですので、Astroのプリセット（ビルドは`npm run build`、出力は`dist`）で出せます。

### Astro / Starlight

ドキュメントサイト向けのテーマで、MarkdownとMDXを扱えます。既定の検索は[Pagefind](https://starlight.astro.build/guides/site-search/)です。追加の設定なしに、ヘッダーへ検索欄が出ます。Pagefindの日本語対応は、後述します。国際化や、フロントマターの検証、アクセシビリティの既定値も揃っています。

Liquidは使えません。前展開が前提です。記事は、既定では`src/content/docs/`に置きます。`title`などのフロントマターも、Starlightのスキーマに合わせる必要があります。バージョン付きURLは、コンテンツコレクションとカスタムページで組むことになります。Docusaurusのような、専用のバージョン機能はありません。

ドキュメントとして必要なものが、最初から揃っている点が強みです。日本語検索の手間も、6つの中では小さいです。独自のURLと、上流のフロントマターを、どこまで素直に写せるかが、確認すべき点です。

### Docusaurus

ドキュメント向けの機能が多く、バージョン分けや、プラグインの生態系が厚いです。Cloudflare Pagesにも、公式の案内があります。出力は`build`です。

本文はMDXです。展開し残した`{`や`}`は、JSXとして解釈され、ビルドが落ちることがあります。前展開を完了させるか、残った波括弧をエスケープする処理が、ほかの候補より厳密に必要です。GitHub Docsの`enterprise-cloud@latest`のようなパスは、Docusaurus標準のバージョンURLとは形が違います。標準機能を使うにしても、パスの対応を別途組むことになります。

既定の検索はAlgolia DocSearchです。アカウントが要ります。静的な検索にするなら、コミュニティのPagefindプラグイン（[`docusaurus-plugin-pagefind`](https://github.com/toasty-kj/docusaurus-plugin-pagefind)や[`docusaurus-pagefind-search`](https://www.npmjs.com/package/docusaurus-pagefind-search)）を足すことになります。公式の組み込みではありません。

ビルドは、後述するとおり、同じ規模では遅めです。メモリも多めに使います。第2フェーズ以降のプレビュー時間と、CIの制限は、早めに測った方がよいです。

### VitePress

Vue製のドキュメント向けSSGです。Cloudflare Pagesに公式の案内があり、ビルドは`npx vitepress build`、出力は`.vitepress/dist`です。同じ規模なら、後述の測定では、StarlightやDocusaurusより速くビルドできています。

既定のローカル検索はMiniSearchです。公式ドキュメントは、中国語と日本語の連続する文字を、既定で`Intl.Segmenter`により分割すると説明しています。`Intl.Segmenter`の無いブラウザでは、空白や句読点だけで切る処理に戻り、複数語の検索が外れる場合があります。2024年4月以降の主要ブラウザには、このAPIがあります。加えて、コミュニティの[`vitepress-plugin-pagefind`](https://www.npmjs.com/package/vitepress-plugin-pagefind)もあります。

Liquidは使えません。Vueのテンプレートが`{{ }}`を使うため、前展開はほぼ必須です。サイドバーは、設定ファイルに書くのが基本です。ページ数が増えると、目次の自動生成が必要になります。VS Code docsの`toc.json`を、そこへ写す作業が発生します。

### Hugo

Go製で、テンプレートはGoの`html/template`です。Liquidは使えません。前展開が前提です。ビルドは、公開されている数字の範囲では、6つの中で最も速いです。Cloudflare Pagesのプリセットは、コマンドが`hugo`、出力が`public`です。パーマリンクの自由度は高く、`/github/enterprise-cloud@latest/...`のようなパスも、設定で表現しやすいです。

ドキュメント向けの既定テーマは、StarlightやMkDocs Materialほど「そのまま使える」形ではありません。見た目と、目次、検索欄は、自分たちで選ぶか、書くことになります。日本語検索は、後述のPagefindをビルド後にかける方法が、よく使われています。Goテンプレートに慣れていなければ、学習のコストは、JavaScript系より高くなりやすいです。

### Eleventy

テンプレート言語を選べます。その一つがLiquid（liquidjs）です。Cloudflare Pagesのプリセットは、コマンドが`npx @11ty/eleventy`、出力が`_site`です。パーマリンクの自由度は、Hugoと同様に高いです。

前述のとおり、標準のLiquidだけではGitHub Docsの独自タグは動きません。カスタムタグとして足すか、前展開するか、どちらかが必要です。ドキュメント向けの既定テーマは無いため、レイアウト、目次、検索は自分たちで組むことになります。検索は、ビルド後にPagefindをかける例が多く、`eleventy.after`のフックで続ける書き方も公開されています。

「Liquidを中で扱える」点と、URLの自由度が持ち味です。その代わり、ドキュメントサイトとしての見た目や検索は、StarlightやVitePressより、手元の作業が増えます。

### MkDocs Material

Python製のドキュメント向けテーマです。見た目と、目次、検索欄が最初から揃っています。Cloudflare Pagesにも公式の案内があり、コマンドは`mkdocs build`、出力は`site`です。言語を日本語にすると、UIの文言も日本語になります。

Liquidは使えません。前展開が前提です。ナビゲーションは、`mkdocs.yml`に書くのが基本です。ページ数が数千を超えると、目次ファイルの管理が重くなりやすいです。自動生成で補うことになります。URLの形も、GitHub Docsのバージョン付きパスを、どこまで自然に出できるかは、ほかの候補より確認が多くなりそうです。依存はPythonになります。公開リポジトリのほかの作業がJavaScript中心なら、ツールが二つに分かれます。

既定の検索はlunr.jsで、`lang: ja`を指定できます。日本語の分割はクライアント側で行われ、分割の精度には既知の限界があります。後述します。

## ビルド時間

初版の20ページでは、どの候補でも、20分の制限は問題になりません。効いてくるのは、第2フェーズ以降です。

次の数字は、いずれも第三者の測定です。条件が違うため、横並びに「公式の順位」とは言えません。傾向を見るための目安です。このプロジェクトの原稿で測った値ではありません。

[SSG Production](https://ssg-production.com/choosing-the-right-static-site-generator-for-production/docs-frameworks-docusaurus-starlight-vitepress/comparing-docs-framework-build-times/)は、同じ原稿を、Docusaurus 3.6、Starlight 0.29（Astro 4.16）、VitePress 1.5でビルドしています。構文の強調と、ローカル検索の索引作成を、すべて有効にしています。5,000ページの中央値は、VitePressが101秒、Starlightが186秒、Docusaurus（Rspackを使う`faster`オプション）が224秒でした。ほぼ線形に伸びています。このまま1万ページへ伸ばすと、およそ3.5分、6分、7.5分です。いずれも、Cloudflare Pagesの20分には収まる見込みです。Docusaurusをwebpackのままにすると、5,000ページのビルドが、メモリ7GBの通常ランナーでは終わらなかった、とも書かれています。

Hugoについては、10,000ページで約1.82秒とする測定（[Michael Nordmeyerの2024年の測定を紹介した記事](https://gethugothemes.com/hugo-vs-jekyll)）と、約3〜5秒とする2026年の比較記事（[takao.blog](https://takao.blog/ja/web/static-site-generators-2026-comparison/)）があります。どちらも、秒の単位です。同じ記事は、Eleventyの1万ページを約60〜120秒としています。Eleventyの数字は、Hugoの1.82秒の測定ほど、条件が詳しく書かれていません。

MkDocs Materialの、1万ページ級の信頼できる測定は、今回は見つかりませんでした。初版で困るとまでは言えませんが、第2フェーズの前に、自分たちの原稿で測る必要があります。

検索の索引作成は、ビルド時間に上乗せされます。Starlightの上記測定では、Pagefindの索引がビルドの約12%でした。どのツールで検索するかによって、この上乗せは変わります。

## 日本語の検索

空白で語を区切らない日本語では、英語向けの索引をそのまま使うと、ヒットしにくくなります。候補ごとの状況は、次のとおりです。

**Pagefind**は、静的なHTMLから索引を作り、検索はブラウザだけで完結します。外部の検索サービスは不要です。`npx pagefind`が入れる拡張版（`pagefind_extended`）は、日本語の分割に対応しています。UIの文言にも日本語があります。語幹処理（stemming）は、日本語にはありません。`<html lang="ja">`が付いていれば、分割は自動で行われます。Starlightは、これを既定で使います。VitePress、Docusaurus、Hugo、Eleventy、MkDocsも、ビルドのあとに同じ索引を足せます。

**VitePressのMiniSearch**は、公式が`Intl.Segmenter`による日本語の分割を既定にしています。追加のプラグインなしでも、現代のブラウザでは日本語検索が期待できます。より確実に分割したい場合は、Pagefindへ切り替えられます。

**MkDocs Materialのlunr**は、`lang: ja`で日本語を指定できます。分割はクライアント側で、lunr-languagesのTinySegmenterを使います。公式の議論では、分割を誤ることがある、と認められています。使えないわけではありません。品質を重視するなら、Pagefindを足す方が安全です。

**Docusaurus**の既定はAlgoliaです。日本語も扱えますが、外部サービスと、申請または契約が要ります。静的に済ませるなら、Pagefindのコミュニティプラグインを使います。

**Hugo**と**Eleventy**には、日本語向けの検索は付属しません。Pagefindをビルド後にかけるのが、いまのところ一番手間の少ない方法です。

第2フェーズ以降の本文検索は、Pagefindを共通の案にすることを推奨します。Starlightなら既定のまま、ほかならビルド後に足します。これは検索ツールの案であり、SSGの決定ではありません。

## 案としての推奨

ここまでの比較を踏まえた、**案**です。決定ではありません。

**第一候補の案は、AstroのStarlightです。** 前展開でLiquidを処理し、検索は既定のPagefindに任せます。理由は次のとおりです。

- 日本語の全文検索が、追加のツールなしに足ります。
- ドキュメントサイトに必要な目次、検索欄、見出し、アクセシビリティの既定が揃っています。
- Cloudflare Pagesに、Astroとしての公式サポートがあります。
- 1万ページ規模でも、公開されている測定の範囲では、20分の制限に余裕があります。
- どの候補でも前展開はほぼ必要ですので、「Liquidを中で解釈できる」ことだけを理由に、テーマも検索も自分で組む選択には、初版では傾きにくいです。

確認が要るのは、上流のフロントマターをStarlightのスキーマへ写す手間と、`/github/enterprise-cloud@latest/...`のようなパスを、コレクションとパーマリンクで正確に出せるかです。初版はバージョン展開をしないため、この確認は第2フェーズの前でも間に合います。

**次点の案は、Eleventyです。** URLの自由度が高く、どうしてもGitHub DocsのLiquidをビルド内で展開したいときに、カスタムタグを足す道が残ります。その代わり、テーマと検索は自分たちで組むことになります。

VitePressは、ビルドの速さと、公式の日本語分割がある点で、近い位置にあります。`{{ }}`の衝突を前展開で避けられるなら、有力です。目次の自動生成と、長期のページ数を見ながら、Starlightと並べて試す価値はあります。

Hugoは、ビルド時間では抜きん出ています。1万ページを秒で出せることは、全バージョン展開を考えるときの強みです。テーマと、Goテンプレートの習熟が、初版の速さに見合うかは、別に考える必要があります。

Docusaurusは、機能は厚いですが、MDXの厳しさ、標準のバージョンURLと公式GitHub Docsのパスのずれ、ビルドの重さが、このプロジェクトでは負担になりやすいです。MkDocs Materialは、見た目と日本語UIは整っています。目次の管理、バージョン付きURL、既定検索の分割精度、PythonとJavaScriptのツールの分かれが、後ろに回す理由になります。

初版の20ページで、Starlightと、必要ならVitePressかEleventyを、同じ訳文で一度ビルドして比べるのがよいと思います。Liquidの前展開は、そのどれを採っても先に必要です。SSGの試作より、前展開の試作を先に置く方が、仕事の順としては自然です。

## 未決事項

1. **採用するSSG。** この文書は案であり、まだ決めていません。
2. **Liquidを前展開するか、SSG内で独自タグを実装するか。** 前者を基本の案とします。
3. **検索にPagefindを使うか。** 第2フェーズ以降の案として推奨します。初版は簡易な目次でも足ります。
4. **公開リポジトリの名前と、サイトコードの置き場所。** サイト本体は、設計メモとは別の公開リポジトリに置く方針です。名前は未決です。

## 出典

確認日は、特に記すものを除き、2026年11月11日です。

- Cloudflare Pages: [Framework guides](https://developers.cloudflare.com/pages/framework-guides/)、[Build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/)、[Limits](https://developers.cloudflare.com/pages/platform/limits/)
- Starlight: [Site Search](https://starlight.astro.build/guides/site-search/)、[Pages](https://starlight.astro.build/guides/pages/)
- VitePress: [Cloudflare Pagesの案内](https://developers.cloudflare.com/pages/framework-guides/deploy-a-vitepress-site/)、[Search](https://vitepress.dev/reference/default-theme-search)（`Intl.Segmenter`による日本語分割）、[vitepress-plugin-pagefind](https://www.npmjs.com/package/vitepress-plugin-pagefind)
- Docusaurus: [Cloudflare Pagesの案内](https://developers.cloudflare.com/pages/framework-guides/deploy-a-docusaurus-site/)、[docusaurus-plugin-pagefind](https://github.com/toasty-kj/docusaurus-plugin-pagefind)、[docusaurus-pagefind-search](https://www.npmjs.com/package/docusaurus-pagefind-search)
- Hugo: [テンプレートの導入](https://gohugo.io/templates/introduction/)（Goテンプレートであること）、[Cloudflare Pagesの案内](https://developers.cloudflare.com/pages/framework-guides/deploy-a-hugo-site/)
- Eleventy: [Liquid](https://www.11ty.dev/docs/languages/liquid/)、[Custom Tags](https://www.11ty.dev/docs/custom-tags/)、[Cloudflare Pagesの案内](https://developers.cloudflare.com/pages/framework-guides/deploy-an-eleventy-site/)
- MkDocs Material: [Built-in search plugin](https://squidfunk.github.io/mkdocs-material/plugins/search/)、[Changing the language](https://squidfunk.github.io/mkdocs-material/setup/changing-the-language/)、日本語分割の限界は[Discussion #3916](https://github.com/squidfunk/mkdocs-material/discussions/3916)
- Pagefind: [Installing](https://pagefind.app/docs/installation/)（`npx`は拡張版を入れること）、[Multilingual search](https://pagefind.app/docs/multilingual/)
- ビルド時間: [Comparing Docs Framework Build Times](https://ssg-production.com/choosing-the-right-static-site-generator-for-production/docs-frameworks-docusaurus-starlight-vitepress/comparing-docs-framework-build-times/)（Docusaurus 3.6、Starlight 0.29、VitePress 1.5、最大5,000ページ）、Hugoの1.82秒は[gethugothemesの紹介](https://gethugothemes.com/hugo-vs-jekyll)、Hugo 3〜5秒とEleventy 60〜120秒は[takao.blog（2026年）](https://takao.blog/ja/web/static-site-generators-2026-comparison/)
