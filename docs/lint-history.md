# lintの設定と、その経緯

このリポジトリのlintの設定のうち、既定から変えたものと、その理由を記録します。カスタムlintの経緯は、各ルールのREADME.mdにあります。

- [ja-space](../scripts/lint/ja-space/README.md)
- [no-suppress](../scripts/lint/no-suppress/README.md)
- [pnpm-policy](../scripts/lint/pnpm-policy/README.md)

設定を変えるときは、ここに理由を書き足します。lintに掛かる書き方を別の書き方で避けるのではなく、設定を変えるべきかをここで判断します。

道具の構成は[vscode-ext-template](https://github.com/kkun84/vscode-ext-template) に合わせています。

## oxlint（[.oxlintrc.json](../.oxlintrc.json)）

### `typescript/prefer-readonly-parameter-types`: off

EffectやAstroの型は読み取り専用ではないため、この規則を満たすには、ライブラリの型の代わりの独自型を余計に作る必要があります。回り道のコードを生むだけなので、規則を外しました。

### `no-underscore-dangle`: `_tag`と`_meta`を許す

Effectのタグ付きの型は`_tag`で判別するので、この名前は避けられません。許さないと、`value["_tag"]`のように角括弧で書いて規則を避けるコードが生まれます。

### `dot-notation`: error

上の角括弧の書き方を、規則で塞ぎました。名前が規則に掛かるなら、角括弧で避けるのではなく、設定で許すかどうかを決めます。

### テストファイルでは`max-lines-per-function`、`import/max-dependencies`、`unicorn/consistent-function-scoping`を外す

テストは、`describe`の関数の中に場合を並べるので、関数の行数は場合の数で決まります。層を組み合わせて確かめるテストは、importが多くなります。その場合だけで使う偽の翻訳などは、その場合の中に書いたほうが、何を確かめているかを読み取れます。どれも本体のコードを読みやすく保つための規則なので、テストでは外しました。

## fallow（[.fallowrc.json](../.fallowrc.json)）

### `ignoreDependencies`

`@effect/language-service`と`@effect/tsgo`を入れています。前者はtsconfigのプラグイン、後者は`scripts/typecheck.ts`が実行ファイルとして呼ぶので、importの解析では使用を検出できません。

ここに依存を足すと未使用の依存を見逃すので、importで検出できないものだけを入れます。

### `duplicates.ignore`: テストファイル

テストは、前提を揃えるために似た準備を並べます。共通化すると、個々のテストが何を確かめているかが読みにくくなるので、重複の検出から外しました。

## アーキテクチャの規則（[architecture.rules.json](../architecture.rules.json)）

`ARCH-LAYER-001`は`src/core`から、`ARCH-LAYER-002`は`src/services`から、`ARCH-LAYER-003`はCloudflare Workerの中でも動く層(`src/layers`の`d1`、`http`、`cloudflare`、`shared`)から、Node.jsの組み込みモジュールを使うことを禁じます。`ARCH-EXTERNAL-001`は`src/core`から決めた以外の外部パッケージを使うことを禁じます。

vscode-ext-templateでは、`core`が使える外部パッケージは`effect`だけです。このリポジトリでは、Markdownの構文解析が翻訳の中心なので、純粋な構文解析のライブラリ(`unified`、`remark-parse`、`remark-gfm`、`mdast-util-to-string`、`github-slugger`、`yaml`)も許しました。どれも入出力をせず、同じ入力から同じ結果を返します。

`src/core`のテストは、原文の写しを読むのに`node:fs`を、実行にvitestを使うので、テストファイルは除外しました。

## 型検査

型検査は`tsc`ではなく`@effect/tsgo`で行います。`tsc`はEffectの診断（エラー型にbrandが無い、など）を出さないので、`tsc`が通っても`pnpm typecheck`で落ちることがあります。

## 検査しないもの

`content/`は、翻訳のジョブが書く訳文です。人が書く文章ではないので、oxfmt、rumdl、ja-spaceの対象から外しています。訳文の検査は、翻訳のときの構造検査で行います。

## Workerの大きさの上限（[budgets.json](../budgets.json)）

Workerのバンドルに、gzipで300KBの上限を置いています。Workerは訳文もMarkdownの解析も読み込まない設計で、いまの大きさは約190KBです。その大半はEffectです。importを1つ足しただけでMarkdownの解析がまるごと入ることがあるので、大きさで気づけるようにしました。Cloudflare Workersの無料プランの上限は、圧縮後で3MBです。
