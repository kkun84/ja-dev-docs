import { describe, expect, it } from "@effect/vitest"
import { Effect, Option } from "effect"
import { passTime } from "../test/time.ts"
import { BotCheckNotConfigured, ModelRequestFailed, QuotaExceeded, SourceUnavailable } from "../../services/errors.ts"
import { BotCheck, SourceRepository, Translator, WorkflowDispatcher } from "../../services/ports.ts"
import type { Fetch } from "./fetch.ts"
import { geminiTranslatorLayer } from "./gemini.ts"
import { sourceRepositoryLayer, type SourceRepositoryOptions } from "./source-repository.ts"
import { turnstileLayer } from "./turnstile.ts"
import { workflowDispatcherLayer } from "./workflow-dispatcher.ts"

interface Sent {
  readonly url: string
  readonly init: RequestInit | undefined
}

// 決めた応答を順に返し、送られた要求を覚えておく偽のfetch。応答を使い切ったら、最後の応答を返し続ける。
const fakeFetch = (...responses: ReadonlyArray<() => Response>): { readonly fetch: Fetch; readonly sent: Sent[] } => {
  const sent: Sent[] = []
  return {
    sent,
    fetch: (url, init) => {
      sent.push({ url, init })
      const next = responses[Math.min(sent.length, responses.length) - 1]
      return next === undefined ? Promise.reject(new Error("network down")) : Promise.resolve(next())
    }
  }
}

const text =
  (body: string, status = 200) =>
  () =>
    new Response(body, { status })
const json = (body: unknown, status = 200) => text(JSON.stringify(body), status)
const headerOf = (sent: Sent | undefined, name: string): string | null => new Headers(sent?.init?.headers).get(name)

const repositoryOf = (options: SourceRepositoryOptions) =>
  SourceRepository.use((repository) => Effect.succeed(repository)).pipe(Effect.provide(sourceRepositoryLayer(options)))

describe("sourceRepositoryLayer", () => {
  it.effect("ファイルの中身を返す。ファイルが無ければNone", () =>
    Effect.gen(function* () {
      const { fetch, sent } = fakeFetch(text("# Title\n"), text("Not Found", 404))
      const repository = yield* repositoryOf({ fetch })

      expect(yield* repository.read("github/docs", "abc", "content/x.md")).toStrictEqual(Option.some("# Title\n"))
      expect(yield* repository.read("github/docs", "abc", "content/y.md")).toStrictEqual(Option.none())
      expect(sent[0]?.url).toBe("https://raw.githubusercontent.com/github/docs/abc/content/x.md")
    })
  )

  it.effect("404以外の失敗と、応答が無いことは、SourceUnavailableにする", () =>
    Effect.gen(function* () {
      const failing = yield* repositoryOf({ fetch: fakeFetch(text("oops", 500)).fetch })
      const offline = yield* repositoryOf({ fetch: fakeFetch().fetch })

      expect(yield* Effect.flip(failing.read("github/docs", "main", "x.md"))).toStrictEqual(
        new SourceUnavailable({ url: "https://raw.githubusercontent.com/github/docs/main/x.md", detail: "HTTP 500" })
      )
      expect(yield* Effect.flip(offline.read("github/docs", "main", "x.md"))).toBeInstanceOf(SourceUnavailable)
    })
  )

  it.effect("ブランチの最新のコミットを、トークンを付けて取得する", () =>
    Effect.gen(function* () {
      const { fetch, sent } = fakeFetch(json({ sha: "abc123", commit: {} }))
      const repository = yield* repositoryOf({ fetch, githubToken: "token" })

      expect(yield* repository.latestCommit("github/docs", "main")).toStrictEqual(Option.some("abc123"))
      expect(sent[0]?.url).toBe("https://api.github.com/repos/github/docs/commits/main")
      expect(headerOf(sent[0], "authorization")).toBe("Bearer token")
    })
  )

  it.effect("コミットを取得できなければNone。トークンが無ければ認証のヘッダーを付けない", () =>
    Effect.gen(function* () {
      const limited = fakeFetch(json({ message: "rate limited" }, 403))
      const repository = yield* repositoryOf({ fetch: limited.fetch })
      const offline = yield* repositoryOf({ fetch: fakeFetch().fetch })
      const odd = yield* repositoryOf({ fetch: fakeFetch(json({ sha: 1 })).fetch })

      expect(yield* repository.latestCommit("github/docs", "main")).toStrictEqual(Option.none())
      expect(headerOf(limited.sent[0], "authorization")).toBeNull()
      expect(yield* offline.latestCommit("github/docs", "main")).toStrictEqual(Option.none())
      expect(yield* odd.latestCommit("github/docs", "main")).toStrictEqual(Option.none())
    })
  )
})

describe("geminiTranslatorLayer", () => {
  const reply = json({
    candidates: [{ content: { parts: [{ text: JSON.stringify({ translations: [{ id: 1, text: "訳" }] }) }] }, finishReason: "STOP" }]
  })
  const translate = (fetch: Fetch) =>
    passTime(Translator.use((translator) => translator.translate("gemini-3.5-flash-lite", [{ id: 1, text: "Text" }], {}))).pipe(
      Effect.provide(geminiTranslatorLayer({ apiKey: "key", fetch }))
    )

  it.effect("APIキーをヘッダーで送り、訳を返す", () =>
    Effect.gen(function* () {
      const { fetch, sent } = fakeFetch(reply)
      const output = yield* translate(fetch)

      expect([...output.translations]).toStrictEqual([[1, "訳"]])
      expect(sent[0]?.url).toBe("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent")
      expect(headerOf(sent[0], "x-goog-api-key")).toBe("key")
      expect(sent[0]?.url).not.toContain("key=")
    })
  )

  it.effect("1分の上限と一時的な障害は、待ってやり直す", () =>
    Effect.gen(function* () {
      const { fetch, sent } = fakeFetch(text('{"retryDelay": "5s"}', 429), text("overloaded", 503), reply)
      const output = yield* translate(fetch)

      expect(output.translations.size).toBe(1)
      expect(sent).toHaveLength(3)
    })
  )

  it.effect("4回試しても通らなければ、状態コードを付けて失敗する", () =>
    Effect.gen(function* () {
      const { fetch, sent } = fakeFetch(text("overloaded", 503))
      const error = yield* Effect.flip(translate(fetch))

      expect(error).toStrictEqual(new ModelRequestFailed({ spec: "gemini-3.5-flash-lite", status: 503, detail: "HTTP 503: overloaded" }))
      expect(sent).toHaveLength(4)
    })
  )

  it.effect("1日の上限は、やり直さずにQuotaExceededにする", () =>
    Effect.gen(function* () {
      const { fetch, sent } = fakeFetch(text('{"quotaId":"GenerateRequestsPerDayPerProjectPerModel-FreeTier"}', 429))

      expect(yield* Effect.flip(translate(fetch))).toBeInstanceOf(QuotaExceeded)
      expect(sent).toHaveLength(1)
    })
  )

  it.effect("要求の誤りと、応答が無いことは、やり直さずに失敗する", () =>
    Effect.gen(function* () {
      const rejected = fakeFetch(text("too large", 400))

      expect(yield* Effect.flip(translate(rejected.fetch))).toMatchObject({ _tag: "ModelRequestFailed", status: 400 })
      expect(rejected.sent).toHaveLength(1)
      expect(yield* Effect.flip(translate(fakeFetch().fetch))).toMatchObject({ _tag: "ModelRequestFailed", status: undefined })
    })
  )
})

describe("turnstileLayer", () => {
  const verify = (fetch: Fetch, secret?: string) =>
    BotCheck.use((check) => check.verify("token", "203.0.113.1")).pipe(Effect.provide(turnstileLayer({ fetch, secret })))

  it.effect("トークン、秘密鍵、IPアドレスを送り、判定を返す", () =>
    Effect.gen(function* () {
      const { fetch, sent } = fakeFetch(json({ success: true }))

      expect(yield* verify(fetch, "secret")).toBe(true)
      expect(sent[0]?.url).toBe("https://challenges.cloudflare.com/turnstile/v0/siteverify")
      expect(sent[0]?.init?.body).toStrictEqual(new URLSearchParams({ secret: "secret", response: "token", remoteip: "203.0.113.1" }))
    })
  )

  it.effect("通らなかったとき、確かめられなかったときは、通さない", () =>
    Effect.gen(function* () {
      expect(yield* verify(fakeFetch(json({ success: false })).fetch, "secret")).toBe(false)
      expect(yield* verify(fakeFetch(json({})).fetch, "secret")).toBe(false)
      expect(yield* verify(fakeFetch(text("<html>", 500)).fetch, "secret")).toBe(false)
      expect(yield* verify(fakeFetch().fetch, "secret")).toBe(false)
    })
  )

  it.effect("秘密鍵が登録されていなければ、判定せずにBotCheckNotConfiguredで失敗する", () =>
    Effect.gen(function* () {
      const { fetch, sent } = fakeFetch(json({ success: true }))

      expect(yield* Effect.flip(verify(fetch))).toBeInstanceOf(BotCheckNotConfigured)
      expect(yield* Effect.flip(verify(fetch, ""))).toBeInstanceOf(BotCheckNotConfigured)
      expect(sent).toHaveLength(0)
    })
  )
})

describe("workflowDispatcherLayer", () => {
  const options = { repo: "kkun84/ja-dev-docs", workflow: "translate.yml", ref: "main" }
  const dispatch = (fetch: Fetch, token?: string) =>
    WorkflowDispatcher.use((dispatcher) => dispatcher.dispatch).pipe(Effect.provide(workflowDispatcherLayer({ ...options, fetch, token })))

  it.effect("ワークフローを、決めたブランチで起動する", () =>
    Effect.gen(function* () {
      const { fetch, sent } = fakeFetch(text("", 204))
      yield* dispatch(fetch, "token")

      expect(sent[0]?.url).toBe("https://api.github.com/repos/kkun84/ja-dev-docs/actions/workflows/translate.yml/dispatches")
      expect(sent[0]?.init?.body).toBe('{"ref":"main"}')
      expect(headerOf(sent[0], "authorization")).toBe("Bearer token")
    })
  )

  it.effect("トークンが登録されていなければ起動しない", () =>
    Effect.gen(function* () {
      const { fetch, sent } = fakeFetch(text("", 204))
      yield* dispatch(fetch)

      expect(sent).toHaveLength(0)
    })
  )

  it.effect("起動できなくても失敗にしない", () =>
    Effect.gen(function* () {
      yield* dispatch(fakeFetch(text("forbidden", 403)).fetch, "token")
      yield* dispatch(fakeFetch().fetch, "token")
    })
  )
})
