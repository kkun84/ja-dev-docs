import { Effect, Layer, Option, Schema } from "effect"
import { rawUrl } from "../../core/source.ts"
import { SourceUnavailable } from "../../services/errors.ts"
import { SourceRepository } from "../../services/ports.ts"
import { withTimeout, type Fetch } from "./fetch.ts"

const TIMEOUT_MILLIS = 60_000
const NOT_FOUND = 404

const Commit = Schema.Struct({ sha: Schema.String })
const decodeCommit = Schema.decodeUnknownOption(Commit)

export interface SourceRepositoryOptions {
  readonly fetch: Fetch
  /** GitHubのAPIのトークン。無くても動くが、認証なしの回数の上限にかかりやすくなる。 */
  readonly githubToken?: string | undefined
}

/** 原文のリポジトリを、GitHubからHTTPで読む。 */
export const sourceRepositoryLayer = (options: SourceRepositoryOptions): Layer.Layer<SourceRepository> => {
  const headers = {
    accept: "application/vnd.github+json",
    "user-agent": "ja-dev-docs",
    ...(options.githubToken === undefined ? {} : { authorization: `Bearer ${options.githubToken}` })
  }

  // コミットが取れなくても訳せるので、失敗は`None`にする。そのときはブランチの先頭から読む。
  const latestCommit = (repo: string, branch: string) =>
    Effect.tryPromise(async () => {
      const response = await options.fetch(
        `https://api.github.com/repos/${repo}/commits/${branch}`,
        withTimeout({ headers }, TIMEOUT_MILLIS)
      )
      const body: unknown = response.ok ? await response.json() : undefined
      return Option.map(decodeCommit(body), (commit) => commit.sha)
    }).pipe(Effect.orElseSucceed(() => Option.none<string>()))

  const read = (repo: string, revision: string, file: string) => {
    const url = rawUrl(repo, revision, file)
    const unavailable = (detail: string) => new SourceUnavailable({ url, detail })
    return Effect.tryPromise({
      try: async () => {
        const response = await options.fetch(url, withTimeout({}, TIMEOUT_MILLIS))
        return { status: response.status, ok: response.ok, text: response.ok ? await response.text() : "" }
      },
      catch: (error) => unavailable(String(error))
    }).pipe(
      Effect.flatMap(({ status, ok, text }) => {
        if (status === NOT_FOUND) {
          return Effect.succeed(Option.none<string>())
        }
        return ok ? Effect.succeedSome(text) : Effect.fail(unavailable(`HTTP ${status}`))
      })
    )
  }

  return Layer.succeed(SourceRepository, { latestCommit, read })
}
