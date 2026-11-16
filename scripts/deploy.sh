#!/usr/bin/env bash
# ビルド済みのサイトをCloudflare Workersに出す。D1のマイグレーションを当て、シークレットを登録する。
# 必要な環境変数: CLOUDFLARE_API_TOKEN、CLOUDFLARE_ACCOUNT_ID
# 任意: TURNSTILE_SITE_KEY、TURNSTILE_SECRET、DISPATCH_TOKEN
set -euo pipefail
config=dist/server/wrangler.json

# D1のデータベースは、初回のデプロイで自動で作られる(wranglerの自動作成)。
npx wrangler deploy --config "$config" ${TURNSTILE_SITE_KEY:+--var "TURNSTILE_SITE_KEY:$TURNSTILE_SITE_KEY"}
npx wrangler d1 migrations apply ja-dev-docs --remote --config "$config"

secrets=$(node -e '
  const s = {};
  if (process.env.TURNSTILE_SECRET) s.TURNSTILE_SECRET = process.env.TURNSTILE_SECRET;
  if (process.env.DISPATCH_TOKEN) s.GITHUB_DISPATCH_TOKEN = process.env.DISPATCH_TOKEN;
  process.stdout.write(JSON.stringify(s));
')
if [ "$secrets" != "{}" ]; then
  echo "$secrets" | npx wrangler secret bulk --config "$config"
fi
