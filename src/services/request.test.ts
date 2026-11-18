import { describe, expect, it } from "@effect/vitest"
import { Effect, Option } from "effect"
import { TestRecorder, testLayer, type TestOptions } from "../layers/test/index.ts"
import { RequestQueue } from "./ports.ts"
import { requestStatus, requestTranslation, resolvePage } from "./request.ts"

const VSCODE = "microsoft/vscode-docs"
const files = { [`${VSCODE}:docs/a.md`]: "Text.\n" }
const PAGE = "code.visualstudio.com/docs/a"
const request = { page: `https://${PAGE}`, token: "token", ip: "203.0.113.1" }

const run = <A, E>(
  options: TestOptions,
  effect: Effect.Effect<A, E, RequestQueue | TestRecorder | Effect.Services<ReturnType<typeof requestTranslation>>>
) =>
  Effect.gen(function* () {
    const result = yield* effect
    return { result, record: yield* (yield* TestRecorder).read, status: Option.getOrUndefined(yield* (yield* RequestQueue).status(PAGE)) }
  }).pipe(Effect.provide(testLayer({ files, ...options })))

describe("requestTranslation", () => {
  it.effect("列に入れ、翻訳のワークフローを起動し、順番を返す", () =>
    Effect.gen(function* () {
      const { result, record, status } = yield* run({}, requestTranslation(request))

      expect(result).toStrictEqual({ kind: "accepted", reply: { state: "queued", position: 1, published: false } })
      expect(status).toStrictEqual({ state: "queued", position: 1 })
      expect(record.dispatches).toBe(1)
    })
  )

  it.effect("表記の違うURLも、同じページとして数える", () =>
    Effect.gen(function* () {
      const { result } = yield* run(
        {},
        requestTranslation(request).pipe(
          Effect.andThen(requestTranslation({ ...request, page: "https%3A%2F%2Fcode.visualstudio.com%2Fdocs%2Fa%2F" }))
        )
      )

      expect(result).toStrictEqual({ kind: "accepted", reply: { state: "queued", position: 1, published: false } })
    })
  )

  it.effect("前にリクエストされたページは、原文があるかを確かめ直さない", () =>
    Effect.gen(function* () {
      const { record } = yield* run({}, requestTranslation(request).pipe(Effect.andThen(requestTranslation(request))))

      expect(record.reads).toStrictEqual([`${VSCODE}:docs/a.md@main`])
      expect(record.dispatches).toBe(2)
    })
  )

  it.effect("訳がもう公開されていれば、列に入れずにそう答える", () =>
    Effect.gen(function* () {
      const { result, status, record } = yield* run({ published: [PAGE] }, requestTranslation(request))

      expect(result).toStrictEqual({ kind: "accepted", reply: { state: "done", published: true } })
      expect(status).toBeUndefined()
      expect(record.dispatches).toBe(0)
    })
  )

  it.effect.each([
    ["回数の制限にかかった", { rateLimited: true }, request, "rate-limited"],
    ["対象外のURL", {}, { ...request, page: "https://example.com/x" }, "unsupported"],
    ["bot判定の秘密鍵が無い", { human: "not-configured" }, request, "not-ready"],
    ["bot判定に通らなかった", { human: false }, request, "bot-check-failed"],
    ["原文のリポジトリに無いページ", {}, { ...request, page: "code.visualstudio.com/docs/typo" }, "source-not-found"]
  ] as const)("%sリクエストは受け付けず、列に入れない", ([, options, input, reason]) =>
    Effect.gen(function* () {
      const { result, record } = yield* run(options, requestTranslation(input))

      expect(result).toStrictEqual({ kind: "rejected", reason })
      expect(record.dispatches).toBe(0)
    })
  )

  it.effect("対象外のURLは、bot判定より先に断る", () =>
    Effect.gen(function* () {
      const { result } = yield* run({ human: "not-configured" }, requestTranslation({ ...request, page: "https://example.com/x" }))

      expect(result).toStrictEqual({ kind: "rejected", reason: "unsupported" })
    })
  )

  it.effect("1日に受け付ける新しいページの数を超えたら断る", () =>
    Effect.gen(function* () {
      const fill = Effect.gen(function* () {
        const queue = yield* RequestQueue
        yield* Effect.forEach(
          Array.from({ length: 200 }, (_, index) => `code.visualstudio.com/docs/p${index}`),
          (page) => queue.add(page),
          { discard: true }
        )
        return yield* requestTranslation(request)
      })
      const { result } = yield* run({}, fill)

      expect(result).toStrictEqual({ kind: "rejected", reason: "daily-limit" })
    })
  )
})

describe("requestStatus", () => {
  it.effect("リクエストされたことが無いページは、公開されているかだけを答える", () =>
    Effect.gen(function* () {
      const { result } = yield* run({}, requestStatus(PAGE))

      expect(result).toStrictEqual(Option.some({ published: false }))
    })
  )

  it.effect("リクエストしたページの状態と順番を答える", () =>
    Effect.gen(function* () {
      const { result } = yield* run({}, requestTranslation(request).pipe(Effect.andThen(requestStatus(`https://${PAGE}/`))))

      expect(result).toStrictEqual(Option.some({ state: "queued", position: 1, published: false }))
    })
  )

  it.effect("対象外のURLには答えない", () =>
    Effect.gen(function* () {
      const { result } = yield* run({}, requestStatus("https://example.com/x"))

      expect(result).toStrictEqual(Option.none())
    })
  )
})

describe("resolvePage", () => {
  it("正規の形のURLには、翻訳をリクエストする画面を返す", () => {
    expect(resolvePage(`/${PAGE}`)).toStrictEqual({ kind: "untranslated", page: PAGE })
  })

  it.each([
    [`/https://${PAGE}`],
    [`/https:/${PAGE}`],
    [`/${PAGE}/`],
    ["/https%3A%2F%2Fcode.visualstudio.com%2Fdocs%2Fa"],
    ["/code.visualstudio.com/docs/a.md"]
  ])("%sは正規の形へ移す", (pathname) => {
    expect(resolvePage(pathname)).toStrictEqual({ kind: "redirect", location: `/${PAGE}` })
  })

  it("対象外のURLは見つからないと答える", () => {
    expect(resolvePage("/favicon.ico")).toStrictEqual({ kind: "not-found" })
    expect(resolvePage("/docs.github.com/en/enterprise-server@3.10/x")).toStrictEqual({ kind: "not-found" })
  })
})
