import { spawnSync } from "node:child_process"
import { readFileSync, rmSync } from "node:fs"
import { gzipSync } from "node:zlib"

// Workerをデプロイせずにバンドルし、大きさがbudgets.jsonの上限に収まっていることを確かめる。
//
// Workerは、訳文もMarkdownの解析も読み込まない小さなものに保つ。importを1つ足しただけで
// Markdownの解析がまるごと入ることがあるので、大きさで気づけるようにする。
const OUT_DIR = "dist-worker"

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null

const budgets: unknown = JSON.parse(readFileSync(new URL("../budgets.json", import.meta.url), "utf8"))
const worker = isRecord(budgets) ? budgets["worker"] : undefined
const limit = isRecord(worker) && typeof worker["gzipBytes"] === "number" ? worker["gzipBytes"] : 0

rmSync(OUT_DIR, { recursive: true, force: true })
const built = spawnSync("wrangler", ["deploy", "--dry-run", "--outdir", OUT_DIR], {
  encoding: "utf8",
  shell: process.platform === "win32",
  env: { ...process.env, WRANGLER_SEND_METRICS: "false" }
})

if (built.status === 0) {
  const size = gzipSync(readFileSync(`${OUT_DIR}/index.js`)).length
  const summary = `Workerのバンドル: gzipで${size}バイト(上限${limit}バイト)`
  if (size > limit) {
    process.stderr.write(
      `${summary}\n上限を超えました。Workerが読み込むimportを確かめるか、budgets.jsonの上限を理由を付けて上げてください。\n`
    )
    process.exitCode = 1
  } else {
    process.stdout.write(`${summary}\n`)
  }
} else {
  process.stderr.write("Workerのバンドルに失敗しました。\n")
  process.stderr.write(built.stdout + built.stderr)
  process.exitCode = 1
}
