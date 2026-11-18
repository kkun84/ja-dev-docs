// 原文のURLを受け取り、ページを訳して訳文を書く。手元での試訳に使う。
//
//   node src/entrypoints/node/translate.ts [--chain モデル...] <URL>...
//
// 訳文はcontent/<ホスト>/<パス>/<モデル>.md、記録は同じ名前の.jsonに書く。
// 1日の呼び出し回数は数えない。無料枠の上限は、Googleの応答だけで判断する。
import { parseArgs } from "node:util"
import { Effect, Layer } from "effect"
import { uncountedCallBudgetLayer } from "../../layers/shared/call-budget.ts"
import { translatePages } from "../../services/run-job.ts"
import { chainOr, missingEnvironment, runMain, translationLayer } from "./runtime.ts"

const { values, positionals } = parseArgs({ allowPositionals: true, options: { chain: { type: "string", multiple: true } } })
const apiKey = process.env["GEMINI_API_KEY"]

if (apiKey === undefined || apiKey === "") {
  missingEnvironment("GEMINI_API_KEY")
} else {
  runMain(
    translatePages(positionals, chainOr(values.chain)).pipe(
      // 訳せなかったページがあれば、終了コードを1にする。
      Effect.map((results) => (results.every((result) => result.outcome.kind === "translated") ? 0 : 1)),
      Effect.provide(Layer.mergeAll(translationLayer(process.env, apiKey), uncountedCallBudgetLayer))
    )
  )
}
