import { describe, expect, it } from "vitest"
import { afterOutcome, isoTime, pacificDate, staleBefore, utcDate } from "./queue.ts"

const NOW = Date.UTC(2026, 0, 2, 3, 4, 5)

describe("afterOutcome", () => {
  it("訳せたページは公開待ちにする", () => {
    expect(afterOutcome({ kind: "translated" })).toStrictEqual({ state: "translated", error: null })
  })

  it("時間をおけば訳せるページは列に戻し、それ以外は失敗にする", () => {
    expect(afterOutcome({ kind: "requeue", reason: "quota" })).toStrictEqual({ state: "queued", error: "quota" })
    expect(afterOutcome({ kind: "failed", reason: "unsupported URL" })).toStrictEqual({ state: "failed", error: "unsupported URL" })
  })

  it("理由は長さを切って残す", () => {
    expect(afterOutcome({ kind: "failed", reason: "x".repeat(600) }).error).toHaveLength(500)
  })
})

describe("時刻", () => {
  it("ISO 8601の文字列と、UTCの日付にする", () => {
    expect(isoTime(NOW)).toBe("2026-01-02T03:04:05.000Z")
    expect(utcDate(NOW)).toBe("2026-01-02")
  })

  it("止まった翻訳中を列に戻す境目は、2時間前", () => {
    expect(staleBefore(NOW)).toBe("2026-01-02T01:04:05.000Z")
  })

  it("無料枠の日付は太平洋時間で数える", () => {
    expect(pacificDate(NOW)).toBe("2026-01-01")
    expect(pacificDate(Date.UTC(2026, 0, 2, 8))).toBe("2026-01-02")
  })
})
