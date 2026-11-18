import type { Layer } from "effect"
import { requestQueueLayer } from "../../layers/d1/queue.ts"
import { wranglerD1Client } from "../../layers/node/wrangler-d1.ts"
import { unavailableRequestQueueLayer } from "../../layers/shared/call-budget.ts"
import type { RequestQueue } from "../../services/ports.ts"

const isSet = (value: string | undefined): boolean => value !== undefined && value !== ""

/**
 * GitHub Actionsから使う順番待ちの列。wranglerでD1を読み書きする。
 *
 * Cloudflareの認証が無ければ、使おうとすると失敗する列を渡す。Cloudflareの準備の前でも、URLを指定した翻訳は動かせる。
 */
export const queueLayer = (environment: NodeJS.ProcessEnv): Layer.Layer<RequestQueue> =>
  isSet(environment["CLOUDFLARE_API_TOKEN"]) && isSet(environment["CLOUDFLARE_ACCOUNT_ID"])
    ? requestQueueLayer(wranglerD1Client)
    : unavailableRequestQueueLayer
