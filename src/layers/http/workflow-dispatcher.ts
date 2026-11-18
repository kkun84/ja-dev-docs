import { Effect, Layer } from "effect"
import { WorkflowDispatcher } from "../../services/ports.ts"
import type { Fetch } from "./fetch.ts"

export interface WorkflowOptions {
  readonly fetch: Fetch
  /** `owner/name`。 */
  readonly repo: string
  /** ワークフローのファイル名。 */
  readonly workflow: string
  /** 起動するブランチ。 */
  readonly ref: string
  /** このリポジトリのActionsの書き込みだけを持つトークン。登録されていなければ起動しない。 */
  readonly token: string | undefined
}

/**
 * GitHub Actionsのワークフローを起動する。
 *
 * 起動できなくても、リクエストは列に入っている。1時間ごとの起動が拾うので、失敗は警告を残して続ける。
 */
export const workflowDispatcherLayer = (options: WorkflowOptions): Layer.Layer<WorkflowDispatcher> => {
  const { token } = options
  if (token === undefined || token === "") {
    return Layer.succeed(WorkflowDispatcher, { dispatch: Effect.void })
  }
  const url = `https://api.github.com/repos/${options.repo}/actions/workflows/${options.workflow}/dispatches`
  const dispatch = Effect.tryPromise(async () => {
    const response = await options.fetch(url, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, accept: "application/vnd.github+json", "user-agent": "ja-dev-docs" },
      body: JSON.stringify({ ref: options.ref })
    })
    return response.status
  }).pipe(
    Effect.flatMap((status) => (status < 300 ? Effect.void : Effect.logWarning(`workflow dispatch failed: HTTP ${status}`))),
    Effect.catch((error) => Effect.logWarning("workflow dispatch failed", error))
  )
  return Layer.succeed(WorkflowDispatcher, { dispatch })
}
