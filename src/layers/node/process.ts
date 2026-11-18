import { execFile } from "node:child_process"
import { Effect } from "effect"

/** 外部のコマンドの失敗。 */
export interface CommandFailure {
  readonly command: string
  readonly detail: string
}

const MAX_OUTPUT_BYTES = 64 * 1024 * 1024

/** コマンドを実行し、標準出力を返す。終了コードが0でなければ失敗する。引数はシェルを通さずに渡す。 */
export const runCommand = (command: string, args: ReadonlyArray<string>): Effect.Effect<string, CommandFailure> =>
  Effect.callback<string, CommandFailure>((resume) => {
    execFile(command, [...args], { encoding: "utf8", maxBuffer: MAX_OUTPUT_BYTES }, (error, stdout, stderr) => {
      resume(
        error === null
          ? Effect.succeed(stdout)
          : Effect.fail({ command: `${command} ${args[0] ?? ""}`.trim(), detail: stderr === "" ? error.message : stderr })
      )
    })
  })
