import type { Effect } from "effect"
import type { QueueUnavailable } from "../../services/errors.ts"

/** SQLに束縛できる値。 */
export type SqlValue = string | number | null

/**
 * D1にSQLを実行する口。
 *
 * WorkerはD1のバインディングで、GitHub Actionsはwranglerで実装する。SQLの`?1`、`?2`は、`params`の1番目、2番目を指す。
 */
export interface D1Client {
  readonly query: (sql: string, params: ReadonlyArray<SqlValue>) => Effect.Effect<ReadonlyArray<unknown>, QueueUnavailable>
}
