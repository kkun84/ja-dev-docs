# AGENTS.md

VS CodeとGitHubの公式ドキュメントを日本語で読めるようにするサイトです。設計は[docs/design.md](docs/design.md)にあります。

## 環境

- Node.jsの版は`.node-version`に、pnpmの版は`package.json`の`packageManager`に固定しています。Nixがあれば`nix develop`で揃います。
- 版が合っているかは`pnpm check-env`で確かめます。

## 完了の条件

変更を終える前に`pnpm check`を実行し、成功することを確かめます。lint、型検査、テストとカバレッジ、サイトのビルドを順に動かします。

## 層の分け方

- `src/core`: 純粋な関数。原文のURLの解釈、Markdownの断片化、訳の検査、Liquidの展開、リンクの書き換えなど。Node.jsにもEffectのサービスにも依存しない
- `src/services`: 手順。1ページの翻訳、翻訳のジョブ、リクエストの受付。外部とのやりとりは`ports.ts`のサービスを通す
- `src/layers`: サービスの実装。`http`はfetchで書いた実装、`d1`は順番待ちの列のSQL、`cloudflare`はWorkerのバインディング、`node`はNode.jsの組み込みモジュールを使う実装、`shared`は実行環境によらない実装、`test`はテスト用

境界はfallowが検査します。Node.jsの組み込みモジュールは`src/layers/node`の中でだけ使えます。`http`、`d1`、`cloudflare`、`shared`は、Cloudflare Workerの中でも動きます。

`src/core`が使ってよい外部パッケージは、`effect`と、純粋な構文解析のライブラリ(`unified`、`remark-parse`、`remark-gfm`、`mdast-util-to-string`、`github-slugger`、`yaml`)だけです。

## テスト

- テストはVitestで、`src`の各ファイルの隣に置きます。モックライブラリは使いません。
- `src/services`のテストは`src/layers/test`の層を使います。順番待ちの列は、本番と同じSQLを、マイグレーションを当てたメモリ上のSQLiteに実行します。
- 待ち時間のある手順は、`src/layers/test/time.ts`の`passTime`でテストの時計を進めて動かします。

## 守ること

- lintや型検査の警告を、抑止コメントで黙らせてはいけません。`no-suppress`が検出します。警告が誤りだと考えるなら、設定を変える理由を[docs/lint-history.md](docs/lint-history.md)に書いてから設定を直します。
- 規則に掛かる名前を、角括弧のアクセスなど別の書き方で避けてはいけません。
- 型検査は`pnpm typecheck`で行います。`tsc`はEffectの診断を出さないので、`tsc`が通っても完了ではありません。
- `pnpm-workspace.yaml`の供給網対策の設定を緩めてはいけません。コマンドの引数で上書きすることも禁止です。インストールが通らないときは、緩めずに報告します。
- 型付きのエラーを手順の中で握りつぶしてはいけません。サービスの関数はエラーをそのまま返し、列の行き先やHTTPの答えに変える場所を1か所に決めます。
- 外から入る値(HTTPの応答、D1の行、訳文の記録、用語集、リクエストの本文)は、使う前にSchemaでdecodeします。
- `Date.now`と`Math.random`は`src/core`と`src/services`で使えません。時刻は`Clock`から取るか引数で受け取り、乱数は種から作ります。
- 依存関係は版を完全に固定します。公開から7日経っていない版は入りません。
- 依存関係の脆弱性は、CIの`pnpm audit`ではなく、Dependabotのアラートと、プルリクエストの依存関係のレビューで見ます。
- 日本語と英数字の間に半角空白を入れません。`ja-space`が検出し、`--fix`で直します。
- `content/`は翻訳のジョブが書く訳文です。手で直しません。
