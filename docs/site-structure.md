# サイト構成案

GitHub DocsとVS Codeのドキュメントを、原文の構成どおりにまるごと日本語化して公開するサイトの、初期構成と方針です。翻訳本文の作成やサイト実装はこの文書の対象外です。

調査時点の原文は、`github/docs`の`7c3387d`（2026-11-11 05:28 JST）と`microsoft/vscode-docs`の`0cc882e`（2026-11-11 06:44 JST、VS Code 1.146のリリースノートを含む）です。ファイル数やページ数は、このコミットをshallow/sparseクローンして集計した概数です。

## 目次

- [目的](#目的)
- [対象範囲と優先順位](#対象範囲と優先順位)
- [原文リポジトリと同期方針](#原文リポジトリと同期方針)
- [ディレクトリとURLの対応](#ディレクトリとurlの対応)
- [翻訳してはいけない構文と、書式が壊れやすい点](#翻訳してはいけない構文と書式が壊れやすい点)
- [分量と出力ページ数の見積もり](#分量と出力ページ数の見積もり)
- [ホスティング比較](#ホスティング比較)
- [ライセンスと帰属表示](#ライセンスと帰属表示)
- [未決事項](#未決事項)

## 目的

VS Codeの週次リリースやagent周辺の機能、GitHub Docsの比較的新しい機能は、日本語がなかったり、公式日本語版で表やコードブロックなどの書式が大きく崩れていたりする。その穴を、日本人読者向けに埋めたい。

公式のGitHub Docs日本語版は機械翻訳であり、本プロジェクトでは使わない。有志によるドキュメント全体の日本語訳も、調査時点では見つからなかった（VS Codeにはリリースノートだけを訳した[vscode-docs-ja](https://mtkn1.github.io/vscode-docs-ja/)がある）。

そのため、原文リポジトリの構成をそのまま写し、原文の更新差分だけを再翻訳できる形を前提にする。翻訳と実装は、別の安価な一括処理に任せる。

## 対象範囲と優先順位

対象は次の2系統である。どちらも、原文のフォルダ構成とURLに沿って「まるごと」訳すことを最終形とする。ただし初版から全バージョン・全画像・全APIリファレンスを静的出力すると、後述のホスティング制限に抵触しやすい。公開範囲は段階的に広げる。

| 対象 | 原文 | 最終形に含めるもの |
| --- | --- | --- |
| GitHub Docs | [github/docs](https://github.com/github/docs) | `content/`の記事、`data/reusables`、`data/variables`、`data/glossaries`、`data/tables`、`data/ui.yml`、GHESリリースノート（`data/release-notes`）、`assets/`の図版 |
| VS Code docs | [microsoft/vscode-docs](https://github.com/microsoft/vscode-docs) | `docs/`、`api/`、`learn/`、`release-notes/`、`remote-release-notes/`、`remote/`、`blogs/`、`data/variables/`、各ディレクトリの画像 |

次のものは「まるごと」の対象外、または判断が必要である。

- サイトを動かすコードそのもの（GitHub Docsの`src/`など）。必要ならMITのもとで参考にできるが、公式サイトのフォークは必須ではない。
- 公式日本語版（機械翻訳）の流用。
- 製品の商標・ロゴの独自利用。ライセンスは商標権を付与しない。

### 優先して訳すもの

モチベーションに合わせて、新しい情報と書式崩壊の影響が大きいページを先にする。

1. **VS Codeのagent周辺と、直近の週次リリースノート。** `docs/agents/`（68ファイル）、`docs/agent-customization/`（12ファイル）、`docs/chat/`、`docs/intelligentapps/`、および`release-notes/`の最新版（調査時点ではv1.146）。
2. **GitHub Docsの新しい機能領域。** とくに`content/copilot/`（568ファイル）。あわせて、直近に原文が更新されたActionsやリポジトリ、Codespacesなどのページ。
3. **両サイトの「いま使う」中核。** VS Codeの`docs/`全体と`api/`、`learn/`。GitHub DocsのFree, Pro, & Team（fpt）向け中核（`get-started`、`actions`、`repositories`、`pull-requests`、`issues`、`authentication`、`codespaces`、`pages`、`github-cli`など）。
4. **GitHub Enterprise Cloud（ghec）向けページ、残りのGitHub Docsセクション。**
5. **GitHub Enterprise Server（ghes）の現行4バージョン、過去のVS Codeリリースノート、ブログ、REST/GraphQLリファレンス。**

REST（318ファイルが最大約1,487ページに展開）とGraphQL（62ファイルが最大約304ページに展開）は、本文量が少なく自動生成の比重が高い。更新頻度も高いため、初版では後回しを推奨する。`content/site-policy/`（72ファイル、約11.6万語）は法律文書なので、訳すかどうかは別途判断する。

## 原文リポジトリと同期方針

原文は常に上流のコミットに紐づける。翻訳成果物は「どのSHAの、どのパスを訳したか」が追跡できるようにする。

### 置き方

- 上流クローン自体はこのリポジトリに含めない（サブモジュールにする場合も、追跡用のSHAとパス対応表があればよい）。
- 翻訳ソースは、原文のパスを可能な限りそのまま写す。

```text
ja/
  github-docs/
    content/...          # github/docsのcontent/に対応
    data/reusables/...
    data/variables/...
    data/release-notes/...
    data/glossaries/...
    data/tables/...
    data/ui.yml
    assets/...           # 図版を複製する場合
  vscode-docs/
    docs/...
    api/...
    learn/...
    release-notes/...
    remote-release-notes/...
    remote/...
    blogs/...
    data/variables/...
```

公開用のビルド成果物（HTMLなど）は、翻訳ソースとは分けて管理する（別ブランチ、別リポジトリ、または生成専用の出力ディレクトリ）。

### 差分だけ再翻訳する流れ

1. 前回同期した上流SHAと、今回のSHAを記録する。
2. 翻訳対象パスについて、ファイル単位のdiffを取る。
3. 変更が無ければ再翻訳しない。
4. 変更があれば、そのファイル（または変更ハンク）だけを再翻訳する。フロントマターの`versions`や`redirect_from`、`children`だけが変わった場合は、本文を再翻訳せずメタデータだけ更新する。
5. `data/reusables`や`data/variables`（VS Code側も含む）は、参照先の本文ではなく再利用片だけを訳す。再利用片が変われば、それを使う全ページの表示は自動的に更新される。
6. 削除された原文は、翻訳側も削除（またはリダイレクト）する。新規ファイルは新規翻訳キューに入れる。
7. 翻訳メモリは、原文ファイルのハッシュ（必要なら段落ハッシュ）をキーにする。

GitHub Docsは`content/`の1ファイルが、後述のバージョン展開で複数URLになる。翻訳単位は「原文ファイル」であり、「展開後のページ」ではない。`{% ifversion %}`の枝は原文のまま残し、各枝の文章だけを訳す。

## ディレクトリとURLの対応

公開サイトは日本語専用なので、公式サイトのような`/en/`や`/ja/`は付けない。一方、GitHub DocsとVS Code docsではパスが衝突しうる（どちらにも`get-started`や`enterprise`がある）ため、サイト先頭で系統を分ける。

### GitHub Docs

公式のバージョン付きURLに合わせる。fpt（Free, Pro, & Team。github.com向け）はパスにバージョンを付けない。

| 原文 | 公開URL（案） | 公式英語版の対応 |
| --- | --- | --- |
| `content/index.md` | `/github/` | `https://docs.github.com/en` |
| `content/actions/foo.md`（fpt） | `/github/actions/foo` | `/en/actions/foo` |
| 同じファイルのghec向け | `/github/enterprise-cloud@latest/actions/foo` | `/en/enterprise-cloud@latest/actions/foo` |
| 同じファイルのGHES 3.22向け | `/github/enterprise-server@3.22/actions/foo` | `/en/enterprise-server@3.22/actions/foo` |
| `data/release-notes/enterprise-server/...` | 公式と同様のリリースノートURL | GHESリリースノート |

調査時点の現行GHESは`3.22`、`3.21`、`3.20`、`3.19`の4本である。Deprecatedな旧バージョンは公式がアーカイブしており、初版の対象外でよい。

内部リンクは原文どおり製品IDから始まるパス（例: `/actions/creating-actions/about-custom-actions`）で書き、ビルド時に言語プレフィックスとバージョンを付与する。公式と同じ変換をしないと、バージョンをまたいだリンクが切れる。`AUTOTITLE`や`{{ currentArticle }}`も、リンク先タイトルや「同一記事の別バージョン」を解決してから出力する。

画像パスは原文が`/assets/images/...`形式である。図版を複製する場合は同じパスで配信し、公式サイトへ直リンクする場合はその旨を方針として明示する。

### VS Code docs

公式サイト（`https://code.visualstudio.com`）のパスに合わせ、先頭に`/vscode`を付ける。

| 原文 | 公開URL（案） | 公式の対応 |
| --- | --- | --- |
| `docs/agents/foo.md` | `/vscode/docs/agents/foo` | `/docs/agents/foo` |
| `api/...` | `/vscode/api/...` | `/api/...` |
| `learn/...` | `/vscode/learn/...`（公式の公開パスに合わせて調整） | Learn系 |
| `release-notes/v1_146.md` | `/vscode/updates/v1_146`など、公式の更新履歴URLに合わせる | リリースノート |
| `blogs/2026/...` | `/vscode/blogs/2026/...` | ブログ |
| `remote/`、`remote-release-notes/` | 公式のRemote系URLに合わせる | Remote開発の文書 |

目次は原文の`docs/toc.json`、`api/toc.json`、`learn/toc.json`を訳して使う。TOCに載っていない記事は、公式と同様に左ナビへ出さない（ページ自体は公開してよい）。

画像は各記事からの相対パス、またはリポジトリ内の`images/`を基本とする。VS Code側のバイナリはGit LFSで、全体で約1.8GBある。配信方針は[ホスティング比較](#ホスティング比較)を参照する。

## 翻訳してはいけない構文と、書式が壊れやすい点

翻訳パイプラインは、構文を「触らない」ことを原則にする。壊れると公式日本語版と同じ問題（表の崩壊、コードの破損、リンク切れ、バージョン分岐の消失）が再現する。

### GitHub Docs

- **YAMLフロントマター。** キー名、`versions`、`redirect_from`、`layout`、`children`、`contentType`などは原文のまま。訳してよいのは`title`、`shortTitle`、`intro`、`permissions`、`product`、`popularHeading`など、読者に見える文字列だけ。Liquidを含む値（例: `title: '{% data variables.product.prodname_copilot %} documentation'`）は、タグを残して周囲の英語だけを訳す。
- **`{% data reusables.* %}` / `{% data variables.* %}`。** 参照パスは変更しない。訳文は`data/`側の定義に書く。
- **`{% ifversion %}` / `{% elsif %}` / `{% else %}` / `{% endif %}`。** 条件式（`fpt`、`ghec`、`ghes`、`fpt or ghec`、フィーチャー名など）は原文のまま。空白制御のハイフン（`{%- ifversion ghes %}`）も落とさない。調査時点の`content/`では、3,336ファイルが何らかのLiquidを含み、963ファイルが`ifversion`を使う。
- **その他のLiquid。** `{% octicon %}`、`{% raw %}`、`{% comment %}`、`{% codetab %}` / `{% codetabs %}`、`{% cli %}`、`{% rowheaders %}`、プラットフォーム切替（`windows` / `mac` / `linux` / `webui` / `vscode` / `jetbrains` / `visualstudio` / `powershell` / `bash` / `prompt`）、`{% if %}`、`{% for %}`。
- **コードブロックとインラインコード。** 原則として中身は訳さない（コメントを訳すかは別方針）。フェンスの言語指定も維持する。
- **表。** `ifversion`が行の途中や行末に入ることが多く、改行やパイプを1つ増やすだけで表が崩れる。公式日本語版の書式崩壊が起きやすい地点であり、最優先で保護する。
- **リンク。** 内部パス、`AUTOTITLE`、`/enterprise-cloud@latest/{{ currentArticle }}`形式、`/free-pro-team@latest/...`（変換抑制）は構文を維持する。リンクテキストだけを訳す。
- **画像パスと`octicon`。** パスもアイコン名も変えない。altテキストは訳してよい。

### VS Code docs

- **トピックメタデータ。** `ContentId`、`DateApproved`、`MetaSocialImage`、`FeatureStatus`は原文のまま。`MetaDescription`、`MetaTags`、`Keywords`は訳してよい。ページタイトルは先頭のH1から取る。
- **`{% data variables.product.* %}` / `{% data variables.copilot.* %}`。** GitHub Docsと同様、参照は残し、定義は`data/variables/`で訳す（製品名を英語のままにするかは[未決事項](#未決事項)）。調査時点では`docs/`だけでも`{% data variables.product.prodname_vscode_shortname %}`が4,000回を超える。
- **タブやカード。** `{% tab label="..." %}`、`{% /tab %}`、`{% /tabs %}`、`{% /action-card %}`、`card-grid`などのHTML寄せマークアップ。`label`の表示文字列は訳してよいが、タグ自体は壊さない。
- **フィーチャーマーカー。** `feature(agent-artifacts)`のようなライフサイクルマクロ、および`FeatureStatus`。公式ビルドがH1の横に状態を出すため、見出しへ「（プレビュー）」などを手で足さない。
- **リンクと画像。** `/docs/terminal/basics.md`のようなルート相対リンク、相対画像パス。拡張子やアンカーを勝手に変えない。
- **注意書き。** `> [!NOTE]`、`> [!IMPORTANT]`などのGitHub-styleアラート。

### 書式保護のための共通ルール

- 翻訳モデルには、保護対象をプレースホルダに退避してから渡し、復元後にMarkdownとして検査する。
- 検査の例: フロントマターがYAMLとして読めること、Liquidタグの数と種類が原文と一致すること、コードフェンスの開閉が一致すること、表の列数が行ごとに一致すること、内部リンクと画像パスが解決できること。
- 失敗したページは公開せず、原文の構文を優先して差し戻す。

## 分量と出力ページ数の見積もり

コードブロック、インラインコード、Liquidタグを除いた、おおよその英単語数・文字数である。日本語にしたあとの文字数とは一致しない。

### GitHub Docs（`content/`、3,804 Markdownファイル）

| トップレベル | ファイル数 | 概算語数 | 展開後ページ数（現行全バージョン） | fptのみ | fpt+ghec |
| --- | ---: | ---: | ---: | ---: | ---: |
| copilot | 568 | 426,000 | 1,143 | 565 | 1,130 |
| code-security | 566 | 306,000 | 2,904 | 544 | 1,102 |
| admin | 412 | 202,000 | 1,497 | 0 | 168 |
| rest | 318 | 47,000 | 1,487 | 259 | 563 |
| actions | 251 | 161,000 | 1,365 | 249 | 498 |
| organizations | 162 | 54,000 | 729 | 126 | 287 |
| repositories | 127 | 50,000 | 719 | 126 | 252 |
| get-started | 121 | 59,000 | 596 | 120 | 228 |
| apps | 116 | 67,000 | 550 | 114 | 230 |
| billing | 100 | 42,000 | 355 | 91 | 190 |
| codespaces | 96 | 57,000 | 192 | 96 | 192 |
| issues | 88 | 35,000 | 496 | 88 | 176 |
| authentication | 81 | 36,000 | 402 | 73 | 154 |
| pull-requests | 79 | 38,000 | 412 | 78 | 156 |
| migrations | 76 | 38,000 | 348 | 73 | 148 |
| site-policy | 72 | 116,000 | 72 | 72 | 72 |
| account-and-profile | 69 | 19,000 | 360 | 67 | 132 |
| graphql | 62 | 10,000 | 304 | 61 | 112 |
| desktop | 53 | 20,000 | 314 | 53 | 106 |
| education | 53 | 20,000 | 53 | 53 | 53 |
| その他合計 | 334 | 159,000 | 1,512 | 310 | 588 |
| **合計** | **3,804** | **約196万** | **15,910** | **3,234** | **6,591** |

「その他」には`communities`、`contributing`、`sponsors`、`pages`、`integrations`、`search-github`、`packages`、`subscriptions-and-notifications`、`webhooks`、`discussions`、`support`、`nonprofit`、`github-cli`、`github-models`などを含む。

### バージョン展開のしくみ

GitHub Docsの各記事は、フロントマターの`versions`で公開対象を宣言する。さらに本文の`{% ifversion %}`で、同じファイル内の段落や表の行をバージョンごとに出し分ける。

現行の公開バージョンは次の最大6本である。

- `fpt`（Free, Pro, & Team）。URLにバージョンを付けない
- `ghec`（Enterprise Cloud）。`enterprise-cloud@latest`
- `ghes`の現行リリース`3.22`、`3.21`、`3.20`、`3.19`

`versions`の値は`*`（そのプランの現行リリースすべて）や`>=3.20`のような範囲、`feature: copilot`のようなフィーチャー参照（`data/features/*.yml`でプランへ展開）である。調査時点では、3,804ファイルのうち1,883ファイルが6バージョンすべてに出し、1,159ファイルが2バージョン（多くはfpt+ghec）である。

そのため、**翻訳対象のファイル数と、公開HTMLのページ数は一致しない。** 全文を全バージョンで出すと約15,910ページになる。fptだけなら約3,234、fpt+ghecなら約6,591である。`admin`のようにEnterprise専用の大きなセクションは、fptだけにするとほぼ出ない（fpt 0、fpt+ghec 168、全バージョン1,497）。

加えて`data/`側にも訳すべきファイルがある（ページ数には原則として加算しない。例外はGHESリリースノート）。

| `data/` | ファイル数 | 概算語数 | 備考 |
| --- | ---: | ---: | --- |
| reusables | 3,434 | 180,000 | `{% data reusables.* %}`の本体。要翻訳 |
| release-notes | 48 | 89,000 | GHESリリースノート。公開ページになる |
| variables | 28 | 2,600 | 製品名などが中心。訳すかは方針次第 |
| tables | 19 | 4,700 | 要翻訳 |
| glossaries | 2 | 5,900 | 要翻訳 |
| ui.yml | 1 | 1,500 | レイアウト文言。要翻訳 |
| features | 280 | 0 | バージョン判定用。翻訳不要 |
| その他 | 7 | 4,400 | `llms-txt`など |
| **data合計** | **3,819** | **約29万** | |

図版は`assets/`に1,782ファイル（約108MiB、ほとんどがPNG）。25MiBを超えるファイルは無い。

GitHub Docsの翻訳量は、contentとdataを合わせて約225万語・約1,612万文字である。

### VS Code docs

| 領域 | Markdownファイル数 | 概算語数 | 備考 |
| --- | ---: | ---: | --- |
| docs/ | 372 | 614,000 | 本体。`docs/agents/`が68ファイル・約13万語で最大 |
| release-notes/ | 158 | 770,000 | 過去分まで含めると本文量はdocs全体を超える |
| blogs/ | 127 | 176,000 | 2016年〜2026年 |
| api/ | 77 | 119,000 | 拡張機能API |
| remote-release-notes/ | 63 | 21,000 | Remote開発のリリースノート |
| learn/ | 26 | 33,000 | 学習コンテンツ |
| remote/ | 17 | 10,000 | 主にadvanced containers |
| templates/ | 2 | 400 | 翻訳必須ではない |
| data/variables | 2 | 130 | 製品名変数 |
| **合計** | **842**（変数除く） | **約174万** | バージョン展開はほぼ無い（1ファイル≒1ページ） |

`docs/`の内訳（ファイル数順、上位）: `agents` 68、`intelligentapps` 24、`languages` 24、`cpp` 23、`containers` 17、`java` 17、`python` 17、`editing` 15、`configure` 14、`csharp` 14、`remote` 13、`agent-customization` 12。

画像（Git LFSのサイズ合計）は次のとおりで、全体で8,013ファイル・約1.83GBある。

| 領域 | 画像ファイル数 | サイズ |
| --- | ---: | ---: |
| release-notes/ | 3,814 | 約904MiB |
| docs/ | 2,925 | 約507MiB |
| blogs/ | 716 | 約294MiB |
| api/ | 260 | 約66MiB |
| remote-release-notes/ | 125 | 約35MiB |
| learn/ | 148 | 約20MiB |
| その他 | 25 | 約2MiB |

`blogs/2026/08/26/agent-host-vscode.mp4`（約153MiB）は、Cloudflare Pagesの1ファイル25MiB上限を超える。

### 出力ファイル数の目安

ホスティング制限で効くのは「デプロイ1回あたりの全ファイル数」である。HTMLに加え、画像、CSS、JS、フォント、faviconなども数える。静的サイトジェネレータの共通ファイルを約80と仮定した概数は次のとおり。

| 公開範囲 | 概算ファイル数 | 無料のCloudflare Pages（2万ファイル） |
| --- | ---: | --- |
| GitHub全バージョン + VS Code全文 + 全画像 | 約26,600 | **超過** |
| 同上、ただしVS Codeのリリースノート・ブログ画像を除く | 約21,900 | **超過** |
| GitHubのfpt+ghec + VS Code全文 + 全画像 | 約17,300 | 収まるが余裕は少ない |
| GitHubのfpt+ghec + VS Code全文 + GitHub画像 + VS Codeのdocs/api/learn画像 | 約12,600 | 余裕あり |
| GitHubのfptのみ + VS Code全文 + 全画像 | 約14,000 | 収まるが、画像サイズとmp4は別問題 |

ジェネレータがページごとにJSONやプレレンダリングファイルを増やすと、この数字は上ぶれる。2万の上限に対しては、コンテンツ+画像で1.5〜1.7万程度に抑えるのが安全である。

サイトをGitHub用とVS Code用の2プロジェクトに分ければ、全バージョンでもそれぞれ2万未満に収まりやすい（GitHub全バージョン+画像で約17,800、VS Code全文+全画像で約8,900）。ただしVS Codeの全画像（約1.83GB）は、次節のGitHub Pagesの容量上限には収まらない。

## ホスティング比較

候補はCloudflare PagesとGitHub Pagesである。制限は2026-11-11時点の公式ドキュメントに基づく。

### GitHub Pages

出典: [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)、[GitHub's plans](https://docs.github.com/en/get-started/learning-about-github/githubs-plans)。

- **GitHub Freeでは、公開リポジトリからのみ使える。** 本リポジトリはいま非公開なので、無料のままPagesを使うには公開化が必要である。GitHub Pro/Teamでも、非公開リポジトリから出したサイトは原則としてインターネットに公開される。閲覧制限付きのPagesは、GitHub Enterprise CloudのOrganizationが必要である。
- 公開サイトのサイズ上限は**1GB**。ソースリポジトリの推奨上限も1GB。VS Codeの画像だけでも約1.83GBあり、全画像を載せる運用は不可。GitHub Docsの画像（約108MiB）とVS Codeの`docs/`+`api/`+`learn/`画像（約593MiB）に絞れば、HTMLを加えても1GB以内に収まる見込み。
- デプロイのタイムアウトは**10分**。
- 帯域のソフト上限は**月100GB**。
- ビルドのソフト上限は**1時間あたり10回**（カスタムのGitHub Actionsワークフローで公開する場合は適用されない）。Actions分は、公開リポジトリなら無料、非公開リポジトリならプランの無償枠を消費する。
- アカウントあたりのUser/Organizationサイトは1つ。プロジェクトサイトはリポジトリごとに作れる。
- ファイル数の硬い上限は公式には無い。

### Cloudflare Pages

出典: [Cloudflare Pages limits](https://developers.cloudflare.com/pages/platform/limits/)、有料プランのファイル数引き上げは[2026-01-23のChangelog](https://developers.cloudflare.com/changelog/post/2026-01-23-pages-file-limit-increase/)。

- **非公開リポジトリから公開サイトを出せる。** いまのリポジトリ公開範囲のままで使える。
- 無料プランのファイル数上限は**1サイト（1デプロイ）あたり20,000ファイル**。有料プランは環境変数`PAGES_WRANGLER_MAJOR_VERSION=4`を設定すると**100,000ファイル**。
- 1ファイルあたり**25MiB**まで。大きいファイルはR2などへ出す。前述の152MiBのmp4は、Pages単体では置けない。
- ビルドは無料で月500回、同時1本、タイムアウト20分。プレビューデプロイは無制限。
- サイト全体の容量上限や帯域上限は、Pagesの制限ページには書かれていない（静的アセットのリクエストは無料・無制限と説明されている）。
- カスタムドメインは無料でプロジェクトあたり100。プロジェクト数はアカウントあたり100。
- 将来ファイル数が足りなくなれば、[Workers Static Assets](https://developers.cloudflare.com/pages/platform/limits/)（有料でWorkerあたり最大10万ファイル）や、GitHub/VS Codeの2プロジェクト分割に逃げる余地がある。

### 推奨

**初版の公開先はCloudflare Pagesを推奨する。** 理由は次のとおり。

1. いまの非公開リポジトリのまま公開できる（GitHub FreeのPagesは公開リポジトリが必要）。
2. VS Codeの画像をある程度載せるなら、GitHub Pagesの公開サイズ1GBをすぐ超える。Cloudflare Pagesには同種の1GB上限が無い。
3. ビルド制限（20分、帯域）が緩い。ドキュメントサイトの更新追従向きである。

ただし無料プランの2万ファイル制限は、GitHub DocsをGHESまで全展開し、VS Codeの過去画像もすべて1サイトに載せる構成では超える（約26,600）。初版では次のようにするか、サイトを2プロジェクトに分ける。

- 公開対象はまず**GitHub Docsのfpt+ghec**と、**VS Codeの現行docs/api/learn、直近のリリースノート**にする。
- 過去のリリースノートやブログの画像は、公式へリンクするか、必要な分だけ複製する。
- 25MiB超のファイルはR2（または公式へのリンク）へ回す。
- GHES全バージョンやREST/GraphQLは、ファイル数に余裕を見てから足す。必要ならGitHub用とVS Code用にプロジェクトを分ける。

リポジトリを公開し、画像を1GB未満に抑える運用ができるなら、GitHub Pagesも有力である。GitHub上で完結し、公開リポジトリならActions分も無料になる。その場合でも、公式サイトの複製に見える点への免責（非公式であること、関係が無いこと）は両方のホスティングで必要である。

## ライセンスと帰属表示

翻訳して公開すること自体は、出典を明記すれば両ライセンスで可能である。コードを再利用する場合は、それぞれのコードライセンスにも従う。

### GitHub Docs

[LICENSE](https://github.com/github/docs/blob/main/LICENSE)と[README](https://github.com/github/docs/blob/main/README.md)によれば、デュアルライセンスである。

- `assets/`、`content/`、`data/`のドキュメントとコンテンツは[Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/)（CC BY 4.0）
- コードは[MIT License](https://github.com/github/docs/blob/main/LICENSE-CODE)

CC BY 4.0では、原著者（GitHub）のクレジット、ライセンスへのリンク、変更したことの表示（日本語訳であること、必要なら変更日や範囲）が必要である。翻訳物には、互換性のあるライセンスを付ける。

### VS Code docs

[LICENSE.md](https://github.com/microsoft/vscode-docs/blob/main/LICENSE.md)によれば、次のとおりである。

- ドキュメントは[Creative Commons Attribution 3.0 United States](https://creativecommons.org/licenses/by/3.0/us/legalcode)（CC BY 3.0 US）
- コードはMIT License
- Microsoftの商標やロゴを使う権利は付与されない。商標の扱いは[Microsoftのガイドライン](https://go.microsoft.com/fwlink/?LinkID=254653)に従う

こちらも、Microsoft（および原文の著者表示）へのクレジット、ライセンスへのリンク、改変（日本語訳）の明示が必要である。ロゴを公式と誤認される形で使わない。

### サイト上の表示（案）

フッターまたは「このサイトについて」に、少なくとも次を置く。

- 本サイトは非公式の日本語訳であり、GitHubおよびMicrosoftとは提携・保証の関係に無いこと
- 原文のリポジトリ名とURL、参照しているコミット（または更新日）
- 各系統のライセンス名とライセンス全文（または公式ライセンスページ）へのリンク
- 原文を翻訳・再構成していること
- 公式サイト（[GitHub Docs](https://docs.github.com/)、[VS Code Documentation](https://code.visualstudio.com/docs)）へのリンク

製品名の表記、ロゴの使用可否、翻訳文のライセンス（翻訳側もCC BYにするか）は、公開前に一文にまとめる。

## 未決事項

方針を固めるために、次を決めてほしい。

1. **リポジトリを公開するか、非公開のままにするか。** 非公開のままならCloudflare Pages一択に近い。公開するならGitHub Pagesも選べるが、翻訳ソースや未公開の下訳も公開される。
2. **初版で出すGitHub Docsのバージョン範囲。** fptのみ、fpt+ghec、現行GHESまで、の3段階がある。推奨はfpt+ghecから始め、GHESは需要とファイル数を見て追加する。
3. **REST/GraphQLリファレンスを初版に含めるか。** ページ数は大きいが本文は少なく、自動生成で変わりやすい。
4. **`site-policy`などの法律文書を訳すか。** 誤訳のリスクが大きい。公式英語（または公式日本語）へリンクする選択肢もある。
5. **VS Codeの過去リリースノートとブログをどこまで載せるか。** 本文量も画像量も大きく、週次で増える。直近N本+過去分は公式リンク、という切り方もできる。既存の有志サイト（リリースノートのみ）との役割分担も検討余地がある。
6. **画像の配信方法。** 複製して自前配信するか、公式URLを参照するか。自前なら追従と容量の負担が増え、参照なら公式側のパス変更や利用条件に依存する。
7. **公開ドメインと、1サイトか2プロジェクトか。** 例: `docs.example.jp/github/`と`/vscode/`の一体型か、サブドメインで分割か。
8. **製品名やUI文言の扱い。** 「VS Code」「GitHub Copilot」「Agents window」などを日本語にするか、原文の製品名を残すか。`data/variables`の訳し方に直結する。
9. **検索、目次、バージョン切替、更新日の出し方。** 静的サイトでも、バージョンピッカーと全文検索の要否は初版の範囲に影響する。
10. **翻訳文のライセンスと、誤訳の免責文面。**

この文書は構成と方針の初期案であり、上記が決まったら範囲とURL、ホスティングの節を更新する。
