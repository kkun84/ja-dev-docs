import { Effect, Layer } from "effect"
import { PublishFailed } from "../../services/errors.ts"
import { Publisher } from "../../services/ports.ts"
import { runCommand } from "./process.ts"

export interface PublisherOptions {
  /** コミットするディレクトリ。 */
  readonly directory: string
  /** pushする先のブランチ。 */
  readonly branch: string
  readonly message: string
}

const git = (...args: ReadonlyArray<string>) => runCommand("git", args)

/**
 * 訳文をgitでコミットし、pushする。コミットするのは訳文のディレクトリの中だけで、ほかの変更は巻き込まない。
 *ほかの実行が先にpushしていても通るよう、pushの前にrebaseする。 */
export const gitPublisherLayer = (options: PublisherOptions): Layer.Layer<Publisher> => {
  const publish = Effect.gen(function* () {
    yield* git("add", "--", options.directory)
    // 変更が無ければ、diff --quietが成功する。訳文のディレクトリの外の変更は、ステージされていても見ない。
    const unchanged = yield* git("diff", "--cached", "--quiet", "--", options.directory).pipe(
      Effect.as(true),
      Effect.orElseSucceed(() => false)
    )
    if (!unchanged) {
      yield* git("commit", "-m", options.message, "--", options.directory)
      // ほかの変更が作業ツリーに残っていても取り込めるよう、一時的に退避させる。
      yield* git("pull", "--rebase", "--autostash", "origin", options.branch)
      yield* git("push", "origin", `HEAD:${options.branch}`)
    }
  }).pipe(Effect.mapError((failure) => new PublishFailed({ detail: `${failure.command}: ${failure.detail}` })))
  return Layer.succeed(Publisher, { publish })
}
