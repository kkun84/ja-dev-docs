# ja-dev-docs

VS CodeとGitHubの公式ドキュメントのページを、日本語で読めるようにするサイトのプロジェクトです。

原文のURLの先頭を書き換えると、そのページの日本語訳を開けます。日本語訳がまだ無いページは、リクエストすると自動で訳されます。

設計は[`docs/design.md`](docs/design.md)にあります。サイトのコードと訳文も、このリポジトリに置きます。

## 原文

- GitHub Docs: [github/docs](https://github.com/github/docs)
- VS Code docs: [microsoft/vscode-docs](https://github.com/microsoft/vscode-docs)

## このリポジトリの中身

- [`docs/design.md`](docs/design.md) — 設計の正本
- `docs/` — 2026-11-11に書いた設計メモ。`docs/design.md`と食い違う箇所では、`docs/design.md`を優先します
- `pipeline/` — 翻訳。原文を取得し、骨組みを保ったまま文の断片だけをモデルで訳し、検査して `content/` に書く
- `content/` — 訳文。`<ホスト>/<パス>/<モデル>.md` が訳文、同じ名前の `.json` がその記録
- `data/glossary.yml` — 製品名などの変数を、訳文でどう書くかの決まり
- `src/` — サイト(AstroとStarlight)。訳があるページは静的に、無いページとAPIはCloudflare Workersで動く
- `migrations/` — D1の順番待ちの列
- `.github/workflows/translate.yml` — 列から取り出して訳し、デプロイする

## 開発

```sh
npm ci
npm test            # 翻訳とリンク書き換えのテスト
npm run build       # サイトのビルド
npm run preview     # ビルドしてローカルのWorkerで動かす(.dev.vars にテスト用のシークレットを書く)
GEMINI_API_KEY=... node pipeline/cli.ts https://code.visualstudio.com/docs/editing/codebasics
```

## 公開の準備

GitHubのリポジトリの設定に、次を登録します。

| 種類 | 名前 | 中身 |
| --- | --- | --- |
| シークレット | `GEMINI_API_KEY` | Google AI StudioのAPIキー(登録済み) |
| シークレット | `CLOUDFLARE_API_TOKEN` | CloudflareのAPIトークン。Workers ScriptsとD1とWorkers Routesの編集、ゾーン`keke.works`のDNSの編集 |
| シークレット | `CLOUDFLARE_ACCOUNT_ID` | CloudflareのアカウントID |
| 変数 | `TURNSTILE_SITE_KEY` | `ja.keke.works`用のTurnstileのサイトキー |
| シークレット | `TURNSTILE_SECRET` | 同じウィジェットの秘密鍵 |
| シークレット | `DISPATCH_TOKEN` | このリポジトリだけに Actions の Read and write を持つ fine-grained token。Workerがワークフローを起動するのに使う |

登録したら、Actionsの`translate`を、訳すページのURLを入れて手で起動します。訳してビルドし、`ja.keke.works`にデプロイし、D1のデータベースも作ります。

費用: Cloudflare Workersの無料プランでは、上限を超えると課金されずにエラーになります。アカウントがWorkers Paidプランの場合は、超過分が課金されるので注意してください。
