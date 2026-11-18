import { Effect, Schema } from "effect"
import { QueueUnavailable } from "../../services/errors.ts"
import type { D1Client, SqlValue } from "../d1/client.ts"
import { runCommand } from "./process.ts"

const DATABASE = "ja-dev-docs"

// wranglerは、実行した文ごとの結果を配列で返す。
const Output = Schema.fromJsonString(Schema.Array(Schema.Struct({ results: Schema.optional(Schema.Array(Schema.Unknown)) })))

/** 値をSQLのリテラルにする。文字列は引用符を重ねてエスケープする。 */
export const sqlLiteral = (value: SqlValue): string => {
  if (value === null) {
    return "NULL"
  }
  return typeof value === "number" && Number.isFinite(value) ? String(value) : `'${String(value).replaceAll("'", "''")}'`
}

/** `?1`、`?2`を、値のリテラルに置き換える。wranglerのコマンドは値の束縛ができないため。 */
export const inlineParams = (sql: string, params: ReadonlyArray<SqlValue>): string =>
  sql.replaceAll(/\?(\d+)/g, (_all, position: string) => sqlLiteral(params[Number(position) - 1] ?? null))

/**
 * GitHub ActionsからD1を読み書きする。wranglerのCLIを通すので、Cloudflareの認証はAPIトークンだけで済む。
 * Workerに列を操作するAPIを置かないので、共有の秘密が要らない。
 */
export const wranglerD1Client: D1Client = {
  query: (sql, params) =>
    runCommand("pnpm", ["exec", "wrangler", "d1", "execute", DATABASE, "--remote", "--json", "--command", inlineParams(sql, params)]).pipe(
      Effect.mapError((failure) => new QueueUnavailable({ detail: `${failure.command}: ${failure.detail}` })),
      Effect.flatMap((stdout) =>
        Schema.decodeEffect(Output)(stdout).pipe(Effect.mapError((issue) => new QueueUnavailable({ detail: String(issue) })))
      ),
      Effect.map((statements) => statements[0]?.results ?? [])
    )
}
