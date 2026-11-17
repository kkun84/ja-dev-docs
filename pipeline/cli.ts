// 原文のURLを受け取り、ページを訳してcontent/ に書き出す。
//
//   node pipeline/cli.ts [--chain モデル...] <URL>...
//
// 訳文はcontent/<ホスト>/<パス>/<モデル>.md、記録は同じ名前の .json に書く。

import { parseArgs } from "node:util";
import { parsePageUrl } from "./sources.ts";
import { geminiCaller } from "./model.ts";
import { DEFAULT_CHAIN, loadGlossaries, translateOne } from "./job.ts";

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    chain: { type: "string", multiple: true },
    out: { type: "string", default: "content" },
  },
});
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
const opts = { chain: values.chain ?? DEFAULT_CHAIN, call: geminiCaller(apiKey), out: values.out! };
const glossaries = await loadGlossaries();

let failed = 0;
for (const input of positionals) {
  const ref = parsePageUrl(input);
  if (!ref) {
    console.error(`unsupported URL: ${input}`);
    failed++;
    continue;
  }
  try {
    console.log(JSON.stringify(await translateOne(ref, opts, glossaries)));
  } catch (e) {
    console.error(`failed: ${input}: ${e}`);
    failed++;
  }
}
process.exitCode = failed ? 1 : 0;
