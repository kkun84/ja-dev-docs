import { spawnSync } from "node:child_process"

// @effect/tsgoはEffectの診断を足したtsgoを同梱している。その実在パスを
// `get-exe-path`で取り、tsconfigを検査する。
// tsconfig.legacy.jsonは作り直す前のコードの分。作り直しが済んだら外す。
const PROJECTS = ["tsconfig.json", "tsconfig.legacy.json"]

const located = spawnSync("effect-tsgo", ["get-exe-path"], { encoding: "utf8", shell: process.platform === "win32" })
const tsgo = located.stdout.trim().split("\n").at(-1) ?? ""

if (located.status !== 0 || tsgo === "") {
  process.stderr.write("effect-tsgo get-exe-pathに失敗しました。\n")
  process.stderr.write(located.stderr)
  process.exitCode = 1
} else {
  const failed = PROJECTS.filter((project) => spawnSync(tsgo, ["-p", project], { stdio: "inherit" }).status !== 0)
  process.exitCode = failed.length === 0 ? 0 : 1
}
