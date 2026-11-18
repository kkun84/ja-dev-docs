# AGENTS.md

VS CodeとGitHubの公式ドキュメントを日本語で読めるようにするサイトです。設計は[docs/design.md](docs/design.md)にあります。

## 環境

- Node.jsの版は`.node-version`に、pnpmの版は`package.json`の`packageManager`に固定しています。Nixがあれば`nix develop`で揃います。
- 版が合っているかは`pnpm check-env`で確かめます。

## 完了の条件

変更を終える前に`pnpm check`を実行し、成功することを確かめます。lint、型検査、テストとカバレッジ、サイトのビルドを順に動かします。

## 守ること

- lintや型検査の警告を、抑止コメントで黙らせてはいけません。`no-suppress`が検出します。警告が誤りだと考えるなら、設定を変える理由を[docs/lint-history.md](docs/lint-history.md)に書いてから設定を直します。
- 規則に掛かる名前を、角括弧のアクセスなど別の書き方で避けてはいけません。
- 型検査は`pnpm typecheck`で行います。`tsc`はEffectの診断を出さないので、`tsc`が通っても完了ではありません。
- `pnpm-workspace.yaml`の供給網対策の設定を緩めてはいけません。コマンドの引数で上書きすることも禁止です。インストールが通らないときは、緩めずに報告します。
- 依存関係は版を完全に固定します。公開から7日経っていない版は入りません。
- 依存関係の脆弱性は、CIの`pnpm audit`ではなく、Dependabotのアラートと、プルリクエストの依存関係のレビューで見ます。
- 日本語と英数字の間に半角空白を入れません。`ja-space`が検出し、`--fix`で直します。
- `content/`は翻訳のジョブが書く訳文です。手で直しません。
