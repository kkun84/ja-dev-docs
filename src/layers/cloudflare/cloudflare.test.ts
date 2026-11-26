import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"
import { QueueUnavailable } from "../../services/errors.ts"
import { PublishedPages, RateLimiter } from "../../services/ports.ts"
import type { D1Binding, RateLimitBinding } from "./bindings.ts"
import { bindingD1Client } from "./d1.ts"
import { publishedPagesLayer, rateLimiterLayer } from "./edge.ts"

describe("bindingD1Client", () => {
  it.effect("SQLと値をバインディングに渡し、行を返す", () =>
    Effect.gen(function* () {
      const seen: unknown[] = []
      const db: D1Binding = {
        prepare: (sql) => ({
          bind: (...values) => ({
            all: () => {
              seen.push(sql, values)
              return Promise.resolve({ results: [{ n: 1 }] })
            }
          })
        })
      }

      expect(yield* bindingD1Client(db).query("SELECT ?1 AS n", [1])).toStrictEqual([{ n: 1 }])
      expect(seen).toStrictEqual(["SELECT ?1 AS n", [1]])
    })
  )

  it.effect("実行できなければQueueUnavailableで失敗する", () =>
    Effect.gen(function* () {
      const db: D1Binding = { prepare: () => ({ bind: () => ({ all: () => Promise.reject(new Error("no such table")) }) }) }

      expect(yield* Effect.flip(bindingD1Client(db).query("SELECT 1", []))).toStrictEqual(
        new QueueUnavailable({ detail: "Error: no such table" })
      )
    })
  )
})

describe("publishedPagesLayer", () => {
  const has = (status: number | undefined) => {
    const urls: string[] = []
    const assets = {
      fetch: (url: string) => {
        urls.push(url)
        return status === undefined ? Promise.reject(new Error("down")) : Promise.resolve(new Response("", { status }))
      }
    }
    return PublishedPages.use((pages) => pages.has("code.visualstudio.com/docs/a")).pipe(
      Effect.provide(publishedPagesLayer(assets, "https://ja-dev-docs.keke.works/api/status?page=x")),
      Effect.map((published) => ({ published, urls }))
    )
  }

  it.effect("静的アセットにページがあれば、公開済みとする", () =>
    Effect.gen(function* () {
      expect(yield* has(200)).toStrictEqual({ published: true, urls: ["https://ja-dev-docs.keke.works/code.visualstudio.com/docs/a/"] })
    })
  )

  it.effect("ページが無いときと、確かめられなかったときは、公開済みとしない", () =>
    Effect.gen(function* () {
      expect((yield* has(404)).published).toBe(false)
      expect((yield* has(undefined)).published).toBe(false)
    })
  )
})

describe("rateLimiterLayer", () => {
  const allow = (limiter?: RateLimitBinding) =>
    RateLimiter.use((rate) => rate.allow("203.0.113.1")).pipe(Effect.provide(rateLimiterLayer(limiter)))

  it.effect("バインディングの判定に従う", () =>
    Effect.gen(function* () {
      expect(yield* allow({ limit: () => Promise.resolve({ success: true }) })).toBe(true)
      expect(yield* allow({ limit: () => Promise.resolve({ success: false }) })).toBe(false)
    })
  )

  it.effect("バインディングが無いときと、判定できなかったときは、制限しない", () =>
    Effect.gen(function* () {
      expect(yield* allow()).toBe(true)
      expect(yield* allow({ limit: () => Promise.reject(new Error("down")) })).toBe(true)
    })
  )
})
