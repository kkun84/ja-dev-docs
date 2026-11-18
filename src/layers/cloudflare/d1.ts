import { Effect } from "effect"
import { QueueUnavailable } from "../../services/errors.ts"
import type { D1Client } from "../d1/client.ts"
import type { D1Binding } from "./bindings.ts"

/** D1のバインディングでSQLを実行する。 */
export const bindingD1Client = (db: D1Binding): D1Client => ({
  query: (sql, params) =>
    Effect.tryPromise({
      try: async () => {
        const { results } = await db
          .prepare(sql)
          .bind(...params)
          .all()
        return results
      },
      catch: (error) => new QueueUnavailable({ detail: String(error) })
    })
})
