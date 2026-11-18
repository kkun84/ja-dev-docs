// デプロイが済んだ後に、公開待ちのページを公開済みにする。
//
//   node src/entrypoints/node/published.ts
//
// 必要な環境変数: CLOUDFLARE_API_TOKEN、CLOUDFLARE_ACCOUNT_ID
import { Effect } from "effect"
import { RequestQueue } from "../../services/ports.ts"
import { queueLayer } from "./queue.ts"
import { runMain } from "./runtime.ts"

runMain(RequestQueue.use((queue) => queue.markPublished).pipe(Effect.provide(queueLayer(process.env))))
