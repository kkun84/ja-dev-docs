import { Clock, Effect, Layer, Option, Schema } from "effect"
import {
  afterOutcome,
  DAILY_NEW_PAGES,
  isoTime,
  pacificDate,
  RequestRow,
  staleBefore,
  utcDate,
  type Outcome,
  type RequestStatus
} from "../../core/queue.ts"
import { QueueUnavailable } from "../../services/errors.ts"
import { RequestQueue } from "../../services/ports.ts"
import type { D1Client, SqlValue } from "./client.ts"

// 順番待ちの列をD1に置く。Cloudflare Queuesの無料プランはメッセージの保持が24時間までで、
// 翌日に持ち越したリクエストが消えるおそれがあるため。表の定義はmigrations/にある。

const Count = Schema.Struct({ n: Schema.Finite })
const PageName = Schema.Struct({ page: Schema.String })
const Usage = Schema.Struct({ count: Schema.Finite })

const ADD = `INSERT INTO requests (page, count, state, first_requested_at, updated_at) VALUES (?1, 1, 'queued', ?2, ?2)
  ON CONFLICT(page) DO UPDATE SET count = count + 1, updated_at = ?2,
    state = CASE WHEN state = 'failed' THEN 'queued' ELSE state END, error = NULL`

// リクエストの多い順、同数なら古い順に並べたときに、この行より前にある順番待ちの数。
const AHEAD = `SELECT COUNT(*) AS n FROM requests WHERE state = 'queued'
  AND (count > ?1 OR (count = ?1 AND first_requested_at < ?2))`

// 順番待ちに加えて、実行が途中で止まった「翻訳中」も取り出す。
const TAKE = `SELECT page FROM requests WHERE state = 'queued' OR (state = 'translating' AND updated_at < ?1)
  ORDER BY count DESC, first_requested_at LIMIT ?2`

const RESERVE = "INSERT INTO usage (day, model, count) VALUES (?1, ?2, 1) ON CONFLICT(day, model) DO UPDATE SET count = count + 1"

// D1が返した行を、決まった形として読む。形が違えば、列を使えないものとして扱う。
const queries = (client: D1Client) => {
  const rows = <S extends Schema.Codec<unknown, unknown>>(schema: S, sql: string, params: ReadonlyArray<SqlValue>) =>
    client.query(sql, params).pipe(
      Effect.flatMap(Schema.decodeUnknownEffect(Schema.Array(schema))),
      Effect.catchTag("SchemaError", (issue) => Effect.fail(new QueueUnavailable({ detail: String(issue) })))
    )
  const first = <S extends Schema.Codec<unknown, unknown>>(schema: S, sql: string, params: ReadonlyArray<SqlValue>) =>
    rows(schema, sql, params).pipe(Effect.map((found) => Option.fromUndefinedOr(found[0])))
  const count = (sql: string, params: ReadonlyArray<SqlValue>) =>
    first(Count, sql, params).pipe(
      Effect.map((row) =>
        Option.getOrElse(
          Option.map(row, ({ n }) => n),
          () => 0
        )
      )
    )
  const run = (sql: string, params: ReadonlyArray<SqlValue>) => Effect.asVoid(client.query(sql, params))
  return { rows, first, count, run }
}

const make = (client: D1Client): RequestQueue["Service"] => {
  const { rows, first, count, run } = queries(client)

  const add = Effect.fn("RequestQueue.add")(function* (page: string) {
    const now = yield* Clock.currentTimeMillis
    const known = (yield* count("SELECT COUNT(*) AS n FROM requests WHERE page = ?1", [page])) > 0
    // 新しいページは、その日に受け付けた数が上限に達していたら受け付けない。
    if (!known && (yield* count("SELECT COUNT(*) AS n FROM requests WHERE first_requested_at >= ?1", [utcDate(now)])) >= DAILY_NEW_PAGES) {
      return false
    }
    yield* run(ADD, [page, isoTime(now)])
    return true
  })

  const status = Effect.fn("RequestQueue.status")(function* (page: string) {
    const row = yield* first(RequestRow, "SELECT * FROM requests WHERE page = ?1", [page])
    if (Option.isNone(row)) {
      return Option.none<RequestStatus>()
    }
    const { state, count: requests, first_requested_at: since } = row.value
    const position = state === "queued" ? (yield* count(AHEAD, [requests, since])) + 1 : 0
    return Option.some<RequestStatus>({ state, position })
  })

  const takeNext = Effect.fn("RequestQueue.takeNext")(function* (limit: number) {
    const now = yield* Clock.currentTimeMillis
    const pages = (yield* rows(PageName, TAKE, [staleBefore(now), limit])).map(({ page }) => page)
    yield* Effect.forEach(
      pages,
      (page) => run("UPDATE requests SET state = 'translating', updated_at = ?2 WHERE page = ?1", [page, isoTime(now)]),
      {
        discard: true
      }
    )
    return pages
  })

  const finish = Effect.fn("RequestQueue.finish")(function* (page: string, outcome: Outcome) {
    const { state, error } = afterOutcome(outcome)
    yield* run("UPDATE requests SET state = ?2, error = ?3, updated_at = ?4 WHERE page = ?1", [
      page,
      state,
      error,
      isoTime(yield* Clock.currentTimeMillis)
    ])
  })

  const reserveCall = Effect.fn("RequestQueue.reserveCall")(function* (model: string, limit: number) {
    const day = pacificDate(yield* Clock.currentTimeMillis)
    yield* run(RESERVE, [day, model])
    const used = yield* first(Usage, "SELECT count FROM usage WHERE day = ?1 AND model = ?2", [day, model])
    return (
      Option.getOrElse(
        Option.map(used, (row) => row.count),
        () => 0
      ) <= limit
    )
  })

  return {
    add,
    status,
    takeNext,
    finish,
    reserveCall,
    markPublished: Clock.currentTimeMillis.pipe(
      Effect.flatMap((now) => run("UPDATE requests SET state = 'done', updated_at = ?1 WHERE state = 'translated'", [isoTime(now)]))
    ),
    countQueued: count("SELECT COUNT(*) AS n FROM requests WHERE state = 'queued'", [])
  }
}

/** D1の上の、順番待ちの列。 */
export const requestQueueLayer = (client: D1Client): Layer.Layer<RequestQueue> => Layer.succeed(RequestQueue, make(client))
