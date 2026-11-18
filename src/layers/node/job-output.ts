import { appendFile } from "node:fs/promises"
import { Effect, Layer } from "effect"
import { JobOutput } from "../../services/ports.ts"

/**
 * ジョブの結果を、GitHub Actionsのステップの出力として書く。
 *
 * `file`は環境変数`GITHUB_OUTPUT`の値。Actionsの外で動かしたときは無いので、ログに出すだけにする。
 */
export const githubOutputLayer = (file?: string): Layer.Layer<JobOutput> =>
  Layer.succeed(JobOutput, {
    set: (name, value) =>
      file === undefined || file === ""
        ? Effect.logInfo(`output ${name}=${value}`)
        : Effect.promise(() => appendFile(file, `${name}=${value}\n`))
  })
