import { Layer } from "effect"
import type { Env } from "../../layers/cloudflare/bindings.ts"
import { bindingD1Client } from "../../layers/cloudflare/d1.ts"
import { publishedPagesLayer, rateLimiterLayer } from "../../layers/cloudflare/edge.ts"
import { requestQueueLayer } from "../../layers/d1/queue.ts"
import type { Fetch } from "../../layers/http/fetch.ts"
import { sourceRepositoryLayer } from "../../layers/http/source-repository.ts"
import { turnstileLayer } from "../../layers/http/turnstile.ts"
import { workflowDispatcherLayer } from "../../layers/http/workflow-dispatcher.ts"

/** 1つの要求を処理する間の、サービスの実装。バインディングと変数は、要求ごとにWorkerに渡る。 */
export const layerFor = (request: Request, env: Env, fetch: Fetch) =>
  Layer.mergeAll(
    requestQueueLayer(bindingD1Client(env.DB)),
    publishedPagesLayer(env.ASSETS, request.url),
    rateLimiterLayer(env.REQUEST_LIMITER),
    sourceRepositoryLayer({ fetch }),
    turnstileLayer({ fetch, secret: env.TURNSTILE_SECRET }),
    workflowDispatcherLayer({
      fetch,
      repo: env.GITHUB_REPO,
      workflow: env.GITHUB_WORKFLOW,
      ref: env.GITHUB_REF,
      token: env.GITHUB_DISPATCH_TOKEN
    })
  )
