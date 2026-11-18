import { readdirSync, readFileSync } from "node:fs"
import { DatabaseSync } from "node:sqlite"
import { Effect } from "effect"
import { QueueUnavailable } from "../../services/errors.ts"
import type { D1Binding } from "../cloudflare/bindings.ts"
import type { D1Client, SqlValue } from "../d1/client.ts"

const MIGRATIONS = new URL("../../../migrations/", import.meta.url)

/**
 * D1と同じSQLが通る、メモリ上のSQLite。本番と同じマイグレーションを当ててある。
 *
 * D1の`?1`、`?2`は同じ値を何度でも指せるが、`node:sqlite`の位置の束縛は出てきた順に値を取る。
 * そのため、SQLに出てくる順に値を並べ直して渡す。
 */
const migrated = (): DatabaseSync => {
  const database = new DatabaseSync(":memory:")
  for (const file of readdirSync(MIGRATIONS).toSorted()) {
    database.exec(readFileSync(new URL(file, MIGRATIONS), "utf8"))
  }
  return database
}

const execute = (database: DatabaseSync, sql: string, params: ReadonlyArray<SqlValue>): ReadonlyArray<unknown> => {
  const ordered = [...sql.matchAll(/\?(\d+)/g)].map((match) => params[Number(match[1]) - 1] ?? null)
  return database.prepare(sql.replaceAll(/\?\d+/g, "?")).all(...ordered)
}

export const memoryD1Client = (): D1Client => {
  const database = migrated()
  return {
    query: (sql, params) =>
      Effect.try({ try: () => execute(database, sql, params), catch: (error) => new QueueUnavailable({ detail: String(error) }) })
  }
}

/** Workerに渡すD1のバインディングの形をした、メモリ上のSQLite。 */
export const memoryD1Binding = (): D1Binding => {
  const database = migrated()
  return {
    prepare: (sql) => ({
      bind: (...values) => ({
        all: async () => {
          await Promise.resolve()
          return { results: execute(database, sql, values) }
        }
      })
    })
  }
}
