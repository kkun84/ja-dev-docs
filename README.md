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
- `src/` — サイト(AstroとStarlight)。静的に出力する
- `worker/` — 訳が無いページの画面と、翻訳リクエストのAPI。Cloudflare Workersで動く
- `migrations/` — D1の順番待ちの列と、翻訳モデルの呼び出し回数
- `.github/workflows/translate.yml` — 列から取り出して訳し、コミットする
- `.github/workflows/deploy.yml` — ビルドしてデプロイし、公開待ちのページを公開済みにする

## 開発

```sh
npm ci
npm test            # 翻訳とリンク書き換えのテスト
npm run build       # サイトのビルド
npm run preview     # ビルドしてローカルのWorkerで動かす(先に npx wrangler d1 migrations apply ja-dev-docs --local)
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

登録したら、Actionsの`deploy`を手で起動します。D1のデータベースを作り、`ja.keke.works`にデプロイします。その後は、訳が無いページのリクエストで翻訳が動きます。

費用について:

- Cloudflare Workersの無料プランでは、上限を超えると課金されずにエラーになります。アカウントがWorkers Paidプランの場合は、超過分が課金されるので注意してください。
- GeminiのAPIキーのプロジェクトには、課金(支払い方法)を設定しないでください。無料枠を超えると、課金されずにエラーになります。翻訳ジョブも1日の呼び出し回数を数え、無料枠の手前で止めます。
