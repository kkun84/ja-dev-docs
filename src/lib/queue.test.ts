import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { addRequest, finish, getStatus, takeNext, type D1Like } from "./queue.ts";

// D1と同じ形で使える、メモリ上のSQLite。
function memoryDb(): D1Like {
  const db = new DatabaseSync(":memory:");
  db.exec(readFileSync(new URL("../../migrations/0001_requests.sql", import.meta.url), "utf8"));
  return {
    prepare(sql) {
      const stmt = db.prepare(sql.replace(/\?(\d+)/g, "?"));
      const order = [...sql.matchAll(/\?(\d+)/g)].map((m) => Number(m[1]) - 1);
      return {
        bind(...values) {
          const args = order.map((i) => values[i]) as any[];
          return {
            run: async () => stmt.run(...args),
            first: async <T,>() => (stmt.get(...args) as T) ?? null,
            all: async <T,>() => ({ results: stmt.all(...args) as T[] }),
          };
        },
      };
    },
  };
}

describe("順番待ちの列", () => {
  it("リクエストの多い順、同数なら古い順に取り出す", async () => {
    const db = memoryDb();
    await addRequest(db, "a", "2026-01-01T00:00:00Z");
    await addRequest(db, "b", "2026-01-01T00:01:00Z");
    await addRequest(db, "c", "2026-01-01T00:02:00Z");
    await addRequest(db, "c", "2026-01-01T00:03:00Z");
    expect((await getStatus(db, "b"))!.position).toBe(3);
    expect(await takeNext(db, 2, new Date("2026-01-01T01:00:00Z"))).toEqual(["c", "a"]);
    expect((await getStatus(db, "b"))!.position).toBe(1);
  });

  it("無料枠の上限で訳せなかったページは列に戻し、失敗したページは再リクエストで列に戻す", async () => {
    const db = memoryDb();
    await addRequest(db, "a");
    await addRequest(db, "b");
    await takeNext(db, 2);
    await finish(db, "a", false, "quota", true);
    await finish(db, "b", false, "boom");
    expect((await getStatus(db, "a"))!.state).toBe("queued");
    expect((await getStatus(db, "b"))!.state).toBe("failed");
    await addRequest(db, "b");
    expect((await getStatus(db, "b"))!.state).toBe("queued");
  });

  it("翻訳中のまま止まったページは、時間がたてば取り出し直す", async () => {
    const db = memoryDb();
    await addRequest(db, "a");
    await takeNext(db, 1, new Date("2026-01-01T00:00:00Z"));
    expect(await takeNext(db, 1, new Date("2026-01-01T01:00:00Z"))).toEqual([]);
    expect(await takeNext(db, 1, new Date("2026-01-01T03:00:00Z"))).toEqual(["a"]);
  });
});
