// GitHub Actionsの翻訳ジョブ。順番待ちの列か、環境変数URLSのページを訳し、コミットしてpushする。
//
//   node src/entrypoints/node/job.ts
//
// 必要な環境変数: GEMINI_API_KEY
// 列(D1)の読み書きに使う環境変数: CLOUDFLARE_API_TOKEN、CLOUDFLARE_ACCOUNT_ID
// 任意の環境変数: URLS(空白区切りのURL)、GITHUB_TOKEN、GITHUB_REF_NAME、GITHUB_OUTPUT
import { Effect, Layer } from "effect"
import { DEFAULT_CHAIN } from "../../core/model.ts"
import { githubOutputLayer } from "../../layers/node/job-output.ts"
import { gitPublisherLayer } from "../../layers/node/publisher.ts"
import { countedCallBudgetLayer } from "../../layers/shared/call-budget.ts"
import { runJob } from "../../services/run-job.ts"
import { queueLayer } from "./queue.ts"
import { CONTENT_DIRECTORY, missingEnvironment, runMain, translationLayer } from "./runtime.ts"

const environment = process.env
const apiKey = environment["GEMINI_API_KEY"]

if (apiKey === undefined || apiKey === "") {
  missingEnvironment("GEMINI_API_KEY")
} else {
  const queue = queueLayer(environment)
  const layer = Layer.mergeAll(
    translationLayer(environment, apiKey),
    queue,
    // 列を使えない(Cloudflareの認証が無い)ときは、回数を数えずに続ける。
    countedCallBudgetLayer.pipe(Layer.provide(queue)),
    gitPublisherLayer({ directory: CONTENT_DIRECTORY, branch: environment["GITHUB_REF_NAME"] ?? "main", message: "訳文を追加" }),
    githubOutputLayer(environment["GITHUB_OUTPUT"])
  )
  const urls = (environment["URLS"] ?? "").split(/\s+/).filter((url) => url !== "")
  runMain(runJob({ urls, chain: DEFAULT_CHAIN }).pipe(Effect.provide(layer)))
}
