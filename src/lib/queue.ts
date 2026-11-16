// D1の順番待ちの列。Workerだけが読み書きし、GitHub ActionsはWorkerのAPIを通して使う。

export interface D1Like {
  prepare(sql: string): { bind(...values: unknown[]): { run(): Promise<unknown>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }> } };
}

export interface RequestRow {
  page: string;
  count: number;
  state: "queued" | "translating" | "done" | "failed";
  first_requested_at: string;
  updated_at: string;
  error: string | null;
}

// 実行が途中で止まった「翻訳中」を、もう一度列に戻すまでの時間。
const STALE_MINUTES = 120;

export async function addRequest(db: D1Like, page: string, now = new Date().toISOString()): Promise<void> {
  await db
    .prepare(
      `INSERT INTO requests (page, count, state, first_requested_at, updated_at) VALUES (?1, 1, 'queued', ?2, ?2)
       ON CONFLICT(page) DO UPDATE SET count = count + 1, updated_at = ?2,
         state = CASE WHEN state = 'failed' THEN 'queued' ELSE state END, error = NULL`,
    )
    .bind(page, now)
    .run();
}

export async function getStatus(db: D1Like, page: string): Promise<(RequestRow & { position: number }) | null> {
  const row = await db.prepare("SELECT * FROM requests WHERE page = ?1").bind(page).first<RequestRow>();
  if (!row) return null;
  const ahead = await db
    .prepare(
      `SELECT COUNT(*) AS n FROM requests WHERE state = 'queued'
       AND (count > ?1 OR (count = ?1 AND first_requested_at < ?2))`,
    )
    .bind(row.count, row.first_requested_at)
    .first<{ n: number }>();
  return { ...row, position: row.state === "queued" ? (ahead?.n ?? 0) + 1 : 0 };
}

// リクエストの多い順、同数なら古い順に取り出し、「翻訳中」にする。
export async function takeNext(db: D1Like, limit: number, now = new Date()): Promise<string[]> {
  const stale = new Date(now.getTime() - STALE_MINUTES * 60_000).toISOString();
  const { results } = await db
    .prepare(
      `SELECT page FROM requests WHERE state = 'queued' OR (state = 'translating' AND updated_at < ?1)
       ORDER BY count DESC, first_requested_at LIMIT ?2`,
    )
    .bind(stale, limit)
    .all<{ page: string }>();
  for (const { page } of results) {
    await db.prepare("UPDATE requests SET state = 'translating', updated_at = ?2 WHERE page = ?1").bind(page, now.toISOString()).run();
  }
  return results.map((r) => r.page);
}

// 訳し終えたページを「完了」に、失敗したページを「失敗」にする。無料枠の上限で訳せなかったページは列に戻す。
export async function finish(db: D1Like, page: string, ok: boolean, error?: string, retry = false, now = new Date().toISOString()): Promise<void> {
  const state = ok ? "done" : retry ? "queued" : "failed";
  await db
    .prepare("UPDATE requests SET state = ?2, error = ?3, updated_at = ?4 WHERE page = ?1")
    .bind(page, state, ok ? null : (error ?? "").slice(0, 500), now)
    .run();
}
