import { describe, expect, it } from "vitest"
import type { Env } from "../../layers/cloudflare/bindings.ts"
import type { Fetch } from "../../layers/http/fetch.ts"
import { memoryD1Binding } from "../../layers/test/sqlite.ts"
import { createWorker } from "./index.ts"

const PAGE = "code.visualstudio.com/docs/a"
const ORIGIN = "https://ja-dev-docs.keke.works"

interface World {
  /** 公開済みのページ。 */
  readonly published?: ReadonlyArray<string>
  /** bot判定の結果。 */
  readonly human?: boolean
  readonly secret?: string
}

// Workerの外の世界。原文のリポジトリにはdocs/a.mdだけがある。外へ送った要求のURLを覚えておく。
const setup = (world: World = {}) => {
  const calls: string[] = []
  const fetch: Fetch = (url) => {
    calls.push(url)
    if (url.startsWith("https://challenges.cloudflare.com/")) {
      return Promise.resolve(Response.json({ success: world.human ?? true }))
    }
    if (url.startsWith("https://api.github.com/")) {
      return Promise.resolve(new Response(null, { status: 204 }))
    }
    const found = url === "https://raw.githubusercontent.com/microsoft/vscode-docs/main/docs/a.md"
    return Promise.resolve(new Response(found ? "# A\n" : "Not Found", { status: found ? 200 : 404 }))
  }
  const env: Env = {
    DB: memoryD1Binding(),
    ASSETS: {
      fetch: (url) =>
        Promise.resolve(new Response("", { status: world.published?.some((page) => url === `${ORIGIN}/${page}/`) === true ? 200 : 404 }))
    },
    TURNSTILE_SITE_KEY: "site-key",
    ...(world.secret === "" ? {} : { TURNSTILE_SECRET: world.secret ?? "secret" }),
    GITHUB_REPO: "kkun84/ja-dev-docs",
    GITHUB_WORKFLOW: "translate.yml",
    GITHUB_REF: "main",
    GITHUB_DISPATCH_TOKEN: "token"
  }
  const worker = createWorker(fetch)
  const get = (path: string) => worker.fetch(new Request(`${ORIGIN}${path}`), env)
  const post = (path: string, body: string) =>
    worker.fetch(new Request(`${ORIGIN}${path}`, { method: "POST", headers: { "cf-connecting-ip": "203.0.113.1" }, body }), env)
  return { calls, get, post, request: (page: string) => post("/api/request", JSON.stringify({ page, token: "token" })) }
}

describe("訳が無いページ", () => {
  it("正規の形のURLには、翻訳をリクエストする画面を返す", async () => {
    const response = await setup().get(`/${PAGE}`)

    expect(response.status).toBe(200)
    expect(response.headers.get("content-type")).toBe("text/html; charset=utf-8")
    expect(response.headers.get("x-robots-tag")).toBe("noindex")
    expect(response.headers.get("content-security-policy")).toContain("default-src 'self'")
    expect(await response.text()).toContain(`data-page="${PAGE}"`)
  })

  it("https://付きやURLエンコードされた形は、正規の形へ移す", async () => {
    const { get } = setup()
    const withScheme = await get(`/https://${PAGE}`)
    const encoded = await get(`/${encodeURIComponent(`https://${PAGE}`)}`)

    expect([withScheme.status, withScheme.headers.get("location")]).toStrictEqual([301, `/${PAGE}`])
    expect([encoded.status, encoded.headers.get("location")]).toStrictEqual([301, `/${PAGE}`])
  })

  it("対象外のURLは404にする", async () => {
    const response = await setup().get("/favicon.ico")

    expect(response.status).toBe(404)
  })
})

describe("/api/request", () => {
  it("列に入れ、ワークフローを起動し、順番を返す", async () => {
    const { request, calls } = setup()
    const response = await request(`https://${PAGE}`)

    expect(response.status).toBe(200)
    expect(response.headers.get("cache-control")).toBe("no-store")
    expect(await response.json()).toStrictEqual({ state: "queued", position: 1, published: false })
    expect(calls).toStrictEqual([
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      "https://raw.githubusercontent.com/microsoft/vscode-docs/main/docs/a.md",
      "https://api.github.com/repos/kkun84/ja-dev-docs/actions/workflows/translate.yml/dispatches"
    ])
  })

  it("訳がもう公開されていれば、そう答える", async () => {
    const response = await setup({ published: [PAGE] }).request(PAGE)

    expect(await response.json()).toStrictEqual({ state: "done", published: true })
  })

  it.each([
    ["対象外のURL", {}, JSON.stringify({ page: "https://example.com/x", token: "t" }), 400, "対象外のURLです"],
    ["JSONでない本文", {}, "not json", 400, "対象外のURLです"],
    ["形の違う本文", {}, JSON.stringify({ page: 1 }), 400, "対象外のURLです"],
    [
      "bot判定に通らなかった",
      { human: false },
      JSON.stringify({ page: PAGE, token: "t" }),
      403,
      "確認に失敗しました。もう一度お試しください"
    ],
    ["秘密鍵が登録されていない", { secret: "" }, JSON.stringify({ page: PAGE, token: "t" }), 503, "受付の準備ができていません"],
    ["原文に無いページ", {}, JSON.stringify({ page: "code.visualstudio.com/docs/typo", token: "t" }), 404, "原文のページが見つかりません"]
  ])("%sは、理由を付けて断る", async (_name, world, body, status, error) => {
    const response = await setup(world).post("/api/request", body)

    expect(response.status).toBe(status)
    expect(await response.json()).toStrictEqual({ error })
  })
})

describe("/api/status", () => {
  it("リクエストしたページの状態を返す", async () => {
    const { request, get } = setup()
    await request(PAGE)
    const response = await get(`/api/status?page=${encodeURIComponent(PAGE)}`)

    expect(await response.json()).toStrictEqual({ state: "queued", position: 1, published: false })
  })

  it("リクエストされたことが無いページは、公開されているかだけを返す", async () => {
    const response = await setup({ published: [PAGE] }).get(`/api/status?page=${PAGE}`)

    expect(await response.json()).toStrictEqual({ published: true })
  })

  it("対象外のURLは断る", async () => {
    const response = await setup().get("/api/status?page=example.com")

    expect(response.status).toBe(400)
  })
})

describe("そのほかの/api/", () => {
  it("知らないパスと、決めていないメソッドは404にする", async () => {
    const { get, post } = setup()

    expect((await get("/api/unknown")).status).toBe(404)
    expect((await get("/api/request")).status).toBe(404)
    expect((await post("/api/status", "{}")).status).toBe(404)
  })
})

describe("想定外の失敗", () => {
  it("内部の情報を出さずに、500で答える", async () => {
    const worker = createWorker(() => Promise.resolve(Response.json({ success: true })))
    const broken: Env = {
      DB: { prepare: () => ({ bind: () => ({ all: () => Promise.reject(new Error("secret detail")) }) }) },
      ASSETS: { fetch: () => Promise.resolve(new Response("", { status: 404 })) },
      TURNSTILE_SITE_KEY: "k",
      TURNSTILE_SECRET: "s",
      GITHUB_REPO: "r",
      GITHUB_WORKFLOW: "w",
      GITHUB_REF: "main"
    }
    const response = await worker.fetch(new Request(`${ORIGIN}/api/status?page=${PAGE}`), broken)

    expect(response.status).toBe(500)
    expect(await response.text()).toBe('{"error":"一時的に処理できませんでした。時間をおいてお試しください"}')
  })
})
