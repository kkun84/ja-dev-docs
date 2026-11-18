// D1の順番待ちの列。WorkerはD1のバインディングで、GitHub Actionsはwranglerで読み書きする。

export interface D1Like {
  prepare(sql: string): { bind(...values: unknown[]): { run(): Promise<unknown>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }> } };
}

export interface RequestRow {
  page: string;
  count: number;
  // queued: 順番待ち。translating: 翻訳中。translated: 訳してコミット済みで、公開(デプロイ)待ち。
  // done: 公開済み。failed: 失敗。もう一度リクエストすると列に戻る。
  state: "queued" | "translating" | "translated" | "done" | "failed";
  first_requested_at: string;
  updated_at: string;
  error: string | null;
}

// 実行が途中で止まった「翻訳中」を、もう一度列に戻すまでの時間。
const STALE_MINUTES = 120;

// 1日に受け付ける新しいページの数。Turnstileを通せる相手でも、無料枠と訳文の量を際限なく増やせないようにする。
export const DAILY_NEW_PAGES = 200;

// リクエストを列に入れる。新しいページで、その日の受付が上限に達していればfalseを返す。
export async function addRequest(db: D1Like, page: string, now = new Date().toISOString()): Promise<boolean> {
  const exists = await db.prepare("SELECT 1 AS x FROM requests WHERE page = ?1").bind(page).first<{ x: number }>();
  if (!exists) {
    const today = await db.prepare("SELECT COUNT(*) AS n FROM requests WHERE first_requested_at >= ?1").bind(now.slice(0, 10)).first<{ n: number }>();
    if ((today?.n ?? 0) >= DAILY_NEW_PAGES) return false;
  }
  await db
    .prepare(
      `INSERT INTO requests (page, count, state, first_requested_at, updated_at) VALUES (?1, 1, 'queued', ?2, ?2)
       ON CONFLICT(page) DO UPDATE SET count = count + 1, updated_at = ?2,
         state = CASE WHEN state = 'failed' THEN 'queued' ELSE state END, error = NULL`,
    )
    .bind(page, now)
    .run();
  return true;
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

// 訳し終えたページを「公開待ち」に、失敗したページを「失敗」にする。無料枠の上限や障害で訳せなかったページは列に戻す。
export async function finish(db: D1Like, page: string, ok: boolean, error?: string, retry = false, now = new Date().toISOString()): Promise<void> {
  const state = ok ? "translated" : retry ? "queued" : "failed";
  await db
    .prepare("UPDATE requests SET state = ?2, error = ?3, updated_at = ?4 WHERE page = ?1")
    .bind(page, state, ok ? null : (error ?? "").slice(0, 500), now)
    .run();
}

// デプロイが済んだので、公開待ちのページを公開済みにする。
export async function markPublished(db: D1Like, now = new Date().toISOString()): Promise<void> {
  await db.prepare("UPDATE requests SET state = 'done', updated_at = ?1 WHERE state = 'translated'").bind(now).run();
}

export async function countQueued(db: D1Like): Promise<number> {
  return (await db.prepare("SELECT COUNT(*) AS n FROM requests WHERE state = 'queued'").bind().first<{ n: number }>())?.n ?? 0;
}

// 翻訳モデルを1回呼ぶ前に、その日の回数を1つ増やす。上限を超えたらfalseを返す(呼ばない)。
export async function reserveCall(db: D1Like, model: string, limit: number, now = new Date()): Promise<boolean> {
  const day = pacificDate(now);
  await db
    .prepare("INSERT INTO usage (day, model, count) VALUES (?1, ?2, 1) ON CONFLICT(day, model) DO UPDATE SET count = count + 1")
    .bind(day, model)
    .run();
  const row = await db.prepare("SELECT count FROM usage WHERE day = ?1 AND model = ?2").bind(day, model).first<{ count: number }>();
  return (row?.count ?? 0) <= limit;
}

// 無料枠は太平洋時間の0時に戻る。
export function pacificDate(now: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}
