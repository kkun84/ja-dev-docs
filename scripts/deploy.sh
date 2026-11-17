#!/usr/bin/env bash
# ビルド済みのサイト(dist/)とWorkerをCloudflare Workersに出す。
# D1のデータベースが無ければ作り、マイグレーションを当て、シークレットを登録する。
# 必要な環境変数: CLOUDFLARE_API_TOKEN、CLOUDFLARE_ACCOUNT_ID
# 任意: TURNSTILE_SITE_KEY、TURNSTILE_SECRET、DISPATCH_TOKEN
set -euo pipefail

if ! pnpm exec wrangler d1 info ja-dev-docs >/dev/null 2>&1; then
  pnpm exec wrangler d1 create ja-dev-docs
fi
pnpm exec wrangler d1 migrations apply ja-dev-docs --remote

pnpm exec wrangler deploy ${TURNSTILE_SITE_KEY:+--var "TURNSTILE_SITE_KEY:$TURNSTILE_SITE_KEY"}

secrets=$(node -e '
  const s = {};
  if (process.env.TURNSTILE_SECRET) s.TURNSTILE_SECRET = process.env.TURNSTILE_SECRET;
  if (process.env.DISPATCH_TOKEN) s.GITHUB_DISPATCH_TOKEN = process.env.DISPATCH_TOKEN;
  process.stdout.write(JSON.stringify(s));
')
if [ "$secrets" != "{}" ]; then
  echo "$secrets" | pnpm exec wrangler secret bulk
fi
