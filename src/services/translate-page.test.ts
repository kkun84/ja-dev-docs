import { describe, expect, it } from "@effect/vitest"
import { Cause, Effect, Exit, Option } from "effect"
import { TestClock } from "effect/testing"
import type { ModelOutput } from "../core/gemini.ts"
import { DEFAULT_CHAIN } from "../core/model.ts"
import { decodeRecord } from "../core/record.ts"
import type { Segment } from "../core/segment.ts"
import { parsePageUrl } from "../core/source.ts"
import { fakeTranslation, TestRecorder, testLayer, type TestOptions } from "../layers/test/index.ts"
import { ModelRequestFailed, PageNotPublishable, QuotaExceeded, SourceNotFound, SourceUnavailable, StoreFailed } from "./errors.ts"
import { translatePage } from "./translate-page.ts"

const NOW = Date.UTC(2026, 0, 2, 3, 4, 5)
const VSCODE = "microsoft/vscode-docs"
const GITHUB = "github/docs"

const run = (url: string, options: TestOptions, chain: ReadonlyArray<string> = DEFAULT_CHAIN) =>
  Effect.gen(function* () {
    yield* TestClock.setTime(NOW)
    const ref = parsePageUrl(url)
    const exit = yield* Effect.exit(ref === undefined ? Effect.die("unsupported URL in the test") : translatePage(ref, chain))
    return { exit, record: yield* (yield* TestRecorder).read }
  }).pipe(Effect.provide(testLayer(options)))

const failureOf = (exit: Exit.Exit<unknown, unknown>): unknown =>
  Exit.isFailure(exit) ? Option.getOrUndefined(Cause.findErrorOption(exit.cause)) : undefined

const constant =
  (text: string) =>
  (_spec: string, segments: ReadonlyArray<Segment>): Effect.Effect<ModelOutput> =>
    Effect.succeed({ translations: new Map(segments.map((segment) => [segment.id, text])), finishReason: "STOP" })

describe("translatePage: VS Codeのページ", () => {
  const files = {
    [`${VSCODE}:docs/editing/basics.md`]:
      "---\nMetaDescription: Learn the basics.\n---\n# Basic editing\n\nPress kb(editor.action.copy) to copy.\n",
    [`${VSCODE}:build/keybindings/doc.keybindings.win.json`]: JSON.stringify([{ key: "ctrl+c", command: "editor.action.copy" }]),
    [`${VSCODE}:build/keybindings/doc.keybindings.osx.json`]: JSON.stringify([{ key: "cmd+c", command: "editor.action.copy" }])
  }

  it.effect("訳文と記録を、ホスト、パス、モデルの場所に書く", () =>
    Effect.gen(function* () {
      const { exit, record } = yield* run("https://code.visualstudio.com/docs/editing/basics", { files })
      const written = record.written.get("code.visualstudio.com/docs/editing/basics/gemini-3.5-flash-lite")

      expect(exit).toStrictEqual(
        Exit.succeed({
          url: "https://code.visualstudio.com/docs/editing/basics",
          model: "gemini-3.5-flash-lite",
          segments: 3,
          segmentsByModel: { "gemini-3.5-flash-lite": 3 },
          untranslated: 0
        })
      )
      expect(written?.markdown).toBe(
        '---\nMetaDescription: "訳Learn the basics."\n---\n# 訳Basic editing\n\n訳Press <kbd title="macOS: ⌘C">Ctrl+C</kbd> to copy.\n'
      )
      expect(yield* decodeRecord(written?.record ?? "")).toMatchObject({
        url: "https://code.visualstudio.com/docs/editing/basics",
        repo: VSCODE,
        file: "docs/editing/basics.md",
        commit: "c0ffee",
        translatedAt: "2026-01-02T03:04:05.000Z",
        model: "gemini-3.5-flash-lite",
        chain: DEFAULT_CHAIN,
        segments: 3,
        untranslated: [],
        headings: ["Basic editing"],
        unresolvedLiquid: [],
        steps: [{ spec: "gemini-3.5-flash-lite", sent: 3, failed: [], finishReason: "STOP", seconds: 0 }]
      })
    })
  )

  it.effect("原文と、原文が参照するファイルを、同じコミットから読む", () =>
    Effect.gen(function* () {
      const { record } = yield* run("code.visualstudio.com/docs/editing/basics", { files })

      expect(record.reads).toStrictEqual([
        `${VSCODE}:docs/editing/basics.md@c0ffee`,
        `${VSCODE}:build/keybindings/doc.keybindings.win.json@c0ffee`,
        `${VSCODE}:build/keybindings/doc.keybindings.osx.json@c0ffee`
      ])
    })
  )

  it.effect("コミットを取得できなければブランチから読み、記録にコミットを書かない", () =>
    Effect.gen(function* () {
      const { record } = yield* run("code.visualstudio.com/docs/editing/basics", { files, commit: null })
      const written = record.written.get("code.visualstudio.com/docs/editing/basics/gemini-3.5-flash-lite")

      expect(record.reads[0]).toBe(`${VSCODE}:docs/editing/basics.md@main`)
      expect((yield* decodeRecord(written?.record ?? "")).commit).toBeUndefined()
    })
  )

  it.effect("ファイル名の候補を順に試す", () =>
    Effect.gen(function* () {
      const { exit, record } = yield* run("code.visualstudio.com/docs/setup", {
        files: { [`${VSCODE}:docs/setup/index.md`]: "Set it up.\n" }
      })

      expect(Exit.isSuccess(exit)).toBe(true)
      expect(record.reads.slice(0, 2)).toStrictEqual([`${VSCODE}:docs/setup.md@c0ffee`, `${VSCODE}:docs/setup/index.md@c0ffee`])
    })
  )

  it.effect("原文が無ければSourceNotFoundで失敗する", () =>
    Effect.gen(function* () {
      const { exit, record } = yield* run("code.visualstudio.com/docs/missing", {})

      expect(failureOf(exit)).toStrictEqual(new SourceNotFound({ page: "code.visualstudio.com/docs/missing" }))
      expect(record.calls).toStrictEqual([])
    })
  )

  it.effect("原文のリポジトリの障害はSourceUnavailableで失敗する", () =>
    Effect.gen(function* () {
      const { exit } = yield* run("code.visualstudio.com/docs/a", { unreadable: [`${VSCODE}:docs/a.md`] })

      expect(failureOf(exit)).toBeInstanceOf(SourceUnavailable)
    })
  )

  it.effect("訳文を書けなければStoreFailedで失敗する", () =>
    Effect.gen(function* () {
      const { exit } = yield* run("code.visualstudio.com/docs/editing/basics", { files, failWrites: true })

      expect(failureOf(exit)).toBeInstanceOf(StoreFailed)
    })
  )

  it.effect("用語集が決まった形でなければStoreFailedで失敗する", () =>
    Effect.gen(function* () {
      const broken = yield* run("code.visualstudio.com/docs/editing/basics", { files, glossary: "code.visualstudio.com: [a" })
      const wrongShape = yield* run("code.visualstudio.com/docs/editing/basics", { files, glossary: "code.visualstudio.com: text" })

      expect(failureOf(broken.exit)).toBeInstanceOf(StoreFailed)
      expect(failureOf(wrongShape.exit)).toMatchObject({ _tag: "StoreFailed", path: "data/glossary.yml" })
    })
  )
})

describe("translatePage: GitHub Docsのページ", () => {
  const files = {
    [`${GITHUB}:content/copilot/about.md`]: [
      "---",
      "title: About {% data variables.product.prodname_copilot_short %}",
      "versions:",
      "  fpt: '*'",
      "---",
      "{% ifversion cool-feature %}Use {% data variables.product.prodname_copilot_short %} today.{% else %}Not available.{% endif %}",
      "",
      "{% data reusables.copilot.note %}",
      "",
      "See [AUTOTITLE](/copilot/setup).",
      ""
    ].join("\n"),
    [`${GITHUB}:data/features/cool-feature.yml`]: "versions:\n  fpt: '*'\n",
    [`${GITHUB}:data/reusables/copilot/note.md`]:
      "{% ifversion ghes %}Server only.{% else %}Cloud only {% data variables.copilot.plan %}.{% endif %}\n",
    [`${GITHUB}:content/copilot/setup.md`]: "---\ntitle: Setting up\n---\n",
    [`${GITHUB}:data/variables/product.yml`]: "prodname_copilot_short: Copilot\n",
    [`${GITHUB}:data/variables/copilot.yml`]: "plan: Pro\n"
  }

  it.effect("読者の版でLiquidを展開し、再利用部品と題名を埋め、変数を値に戻す", () =>
    Effect.gen(function* () {
      const { record } = yield* run("docs.github.com/en/copilot/about", { files })

      expect(record.written.get("docs.github.com/en/copilot/about/gemini-3.5-flash-lite")?.markdown).toBe(
        "---\ntitle: \"訳About Copilot\"\nversions:\n  fpt: '*'\n---\n訳Use Copilot today.\n\n訳Cloud only Pro.\n\n訳See [Setting up](/copilot/setup).\n"
      )
    })
  )

  it.effect("モデルには、変数を目印にし、対応表で値を伝える", () =>
    Effect.gen(function* () {
      const { record } = yield* run("docs.github.com/en/copilot/about", { files })
      const [call] = record.calls

      expect(call?.ids).toStrictEqual([1, 2, 3, 4])
      expect(Object.values(call?.legend ?? {}).toSorted()).toStrictEqual(["/copilot/setup", "Copilot", "Copilot", "Pro"])
    })
  )

  it.effect("用語集に訳語がある変数は、その訳語で戻す", () =>
    Effect.gen(function* () {
      const { record } = yield* run("docs.github.com/en/copilot/about", { files, glossary: "docs.github.com:\n  copilot.plan: プロ\n" })

      expect(record.written.get("docs.github.com/en/copilot/about/gemini-3.5-flash-lite")?.markdown).toContain("訳Cloud only プロ.")
    })
  )

  it.effect("展開できずに残ったタグを記録に残す", () =>
    Effect.gen(function* () {
      const { record } = yield* run("docs.github.com/en/x", {
        files: { [`${GITHUB}:content/x.md`]: "Some text here.\n\n{% unknowntag %}\n" }
      })
      const written = record.written.get("docs.github.com/en/x/gemini-3.5-flash-lite")

      expect((yield* decodeRecord(written?.record ?? "")).unresolvedLiquid).toStrictEqual(["unknowntag"])
    })
  )
})

describe("translatePage: 訳し直し", () => {
  const files = { [`${VSCODE}:docs/a.md`]: "Run `git push` to push.\n\nAnother sentence here.\n" }
  const url = "code.visualstudio.com/docs/a"

  it.effect("検査に落ちた断片だけを、次の指定のモデルで訳し直す", () =>
    Effect.gen(function* () {
      const translate = (spec: string, segments: ReadonlyArray<Segment>) =>
        spec === "a" ? constant("目印を落とした訳です")(spec, segments) : Effect.succeed(fakeTranslation(segments))
      const { record } = yield* run(url, { files, translate }, ["a", "b@low"])
      const written = record.written.get("code.visualstudio.com/docs/a/a")

      expect(record.calls.map((call) => [call.spec, call.ids])).toStrictEqual([
        ["a", [1, 2]],
        ["b@low", [1]]
      ])
      expect(written?.markdown).toBe("訳Run `git push` to push.\n\n目印を落とした訳です\n")
      expect(yield* decodeRecord(written?.record ?? "")).toMatchObject({
        model: "a",
        segmentsByModel: { a: 1, b: 1 },
        steps: [
          { spec: "a", failed: [{ id: 1, errors: ["placeholder"] }] },
          { spec: "b@low", sent: 1, failed: [] }
        ]
      })
    })
  )

  it.effect("要求が拒否されたら、断片を半分に分けて送り直す", () =>
    Effect.gen(function* () {
      const translate = (spec: string, segments: ReadonlyArray<Segment>) =>
        segments.length > 1
          ? Effect.fail(new ModelRequestFailed({ spec, status: 400, detail: "too large" }))
          : Effect.succeed(fakeTranslation(segments))
      const { exit, record } = yield* run(
        url,
        { files: { [`${VSCODE}:docs/a.md`]: "One two three.\n\nFour five six.\n\nSeven eight nine.\n" }, translate },
        ["a"]
      )

      expect(Exit.isSuccess(exit)).toBe(true)
      expect(record.calls.map((call) => call.ids)).toStrictEqual([[1, 2, 3], [1, 2], [1], [2], [3]])
    })
  )

  it.effect("断片が多いページは、1回に送る数を抑えて分けて送る", () =>
    Effect.gen(function* () {
      const text = Array.from({ length: 250 }, (_, index) => `Sentence number ${index} here.\n`).join("\n")
      const { exit, record } = yield* run(url, { files: { [`${VSCODE}:docs/a.md`]: text } }, ["a"])

      expect(Exit.isSuccess(exit)).toBe(true)
      expect(record.calls.map((call) => call.ids.length)).toStrictEqual([120, 120, 10])
    })
  )

  it.effect("未訳の断片が5%を超えたページは書かない。障害が原因なら、やり直せる失敗にする", () =>
    Effect.gen(function* () {
      const down = (spec: string) => Effect.fail(new ModelRequestFailed({ spec, status: 503, detail: "overloaded" }))
      const { exit, record } = yield* run(url, { files, translate: down })

      expect(failureOf(exit)).toStrictEqual(new PageNotPublishable({ reason: "2 of 2 segments untranslated", retry: true }))
      expect(record.written.size).toBe(0)
      expect(record.calls).toHaveLength(3)
    })
  )

  it.effect("モデルの出力が原因なら、やり直さない失敗にする", () =>
    Effect.gen(function* () {
      const { exit } = yield* run(url, { files, translate: constant("> 引用になる訳") })

      expect(failureOf(exit)).toStrictEqual(new PageNotPublishable({ reason: "2 of 2 segments untranslated", retry: false }))
    })
  )

  it.effect("Googleが1日の上限を返したら、上限を理由にする", () =>
    Effect.gen(function* () {
      const quota = (spec: string) => Effect.fail(new QuotaExceeded({ spec, detail: "PerDay" }))
      const { exit } = yield* run(url, { files, translate: quota })

      expect(failureOf(exit)).toStrictEqual(new PageNotPublishable({ reason: "quota", retry: true }))
    })
  )

  it.effect("自分で数えた1日の上限に達したモデルは呼ばず、次の指定のモデルで訳す", () =>
    Effect.gen(function* () {
      const { exit, record } = yield* run(url, { files, budget: { "gemini-3.5-flash-lite": 0 } })
      const written = record.written.get("code.visualstudio.com/docs/a/gemini-3.8-flash")

      expect(Exit.isSuccess(exit)).toBe(true)
      expect(record.calls.map((call) => call.spec)).toStrictEqual(["gemini-3.8-flash@low"])
      expect((yield* decodeRecord(written?.record ?? "")).steps?.map((step) => step.error)).toStrictEqual(["quota", "quota", undefined])
    })
  )

  it.effect("少しの断片が訳せなくても、5%以下なら原文のまま残して書く", () =>
    Effect.gen(function* () {
      const text = Array.from({ length: 40 }, (_, index) => `Sentence number ${index} here.\n`).join("\n")
      const translate = (_spec: string, segments: ReadonlyArray<Segment>) =>
        Effect.succeed({
          ...fakeTranslation(segments),
          translations: new Map([...fakeTranslation(segments).translations].filter(([id]) => id > 2))
        })
      const { exit } = yield* run(url, { files: { [`${VSCODE}:docs/a.md`]: text }, translate }, ["a"])

      expect(exit).toMatchObject(Exit.succeed({ segments: 40, untranslated: 2 }))
    })
  )
})
