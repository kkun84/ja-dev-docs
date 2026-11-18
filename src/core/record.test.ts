import { describe, expect, it } from "@effect/vitest"
import { Effect, Exit } from "effect"
import {
  countByModel,
  decodeRecord,
  describeStep,
  encodeRecord,
  primaryModel,
  translationPath,
  unpublishable,
  type TranslationRecord
} from "./record.ts"

const record: TranslationRecord = {
  url: "https://code.visualstudio.com/docs/a",
  repo: "microsoft/vscode-docs",
  file: "docs/a.md",
  commit: "abc",
  translatedAt: "2026-01-02T03:04:05.000Z",
  model: "gemini-3.5-flash-lite",
  chain: ["gemini-3.5-flash-lite"],
  segments: 2,
  segmentsByModel: { "gemini-3.5-flash-lite": 2 },
  untranslated: [],
  headings: ["A"],
  unresolvedLiquid: [],
  steps: [{ spec: "gemini-3.5-flash-lite", sent: 2, failed: [], finishReason: "STOP", seconds: 1.5 }]
}

describe("訳文の記録", () => {
  it.effect("書いた記録を、同じ中身で読める", () =>
    Effect.gen(function* () {
      expect(yield* decodeRecord(encodeRecord(record))).toStrictEqual(record)
    })
  )

  it("キーの順を固定し、末尾に改行を付ける", () => {
    const json = encodeRecord({ ...record, commit: undefined })

    expect([...json.matchAll(/^ {2}"(\w+)":/gm)].map((match) => match[1])).toStrictEqual([
      "url",
      "repo",
      "file",
      "translatedAt",
      "model",
      "chain",
      "segments",
      "segmentsByModel",
      "untranslated",
      "headings",
      "unresolvedLiquid",
      "steps"
    ])
    expect(json.endsWith("}\n")).toBe(true)
  })

  it.effect("コミットや手順の無い古い記録も読める", () =>
    Effect.gen(function* () {
      const { commit: _commit, steps: _steps, unresolvedLiquid: _liquid, ...old } = record

      expect((yield* decodeRecord(JSON.stringify(old))).commit).toBeUndefined()
    })
  )

  it.effect("形の合わない記録は読まない", () =>
    Effect.gen(function* () {
      expect(Exit.isFailure(yield* Effect.exit(decodeRecord(JSON.stringify({ ...record, segments: "2" }))))).toBe(true)
      expect(Exit.isFailure(yield* Effect.exit(decodeRecord("not json")))).toBe(true)
    })
  )
})

describe("countByModel", () => {
  it("モデルごとの断片の数を数える", () => {
    expect(
      countByModel(
        new Map([
          [1, "a"],
          [2, "b"],
          [3, "a"]
        ])
      )
    ).toStrictEqual({ a: 2, b: 1 })
  })
})

describe("translationPath", () => {
  it("ホスト、パス、モデルの順に並べる。パスが無いページはindexに置く", () => {
    expect(translationPath("docs.github.com", "en/copilot", "m")).toBe("docs.github.com/en/copilot/m")
    expect(translationPath("docs.github.com", "", "m")).toBe("docs.github.com/index/m")
  })
})

describe("primaryModel", () => {
  it("いちばん多くの断片を訳したモデルを返す。1つも訳せていなければ、最初の指定のモデル", () => {
    expect(
      primaryModel(
        new Map([
          [1, "a"],
          [2, "b"],
          [3, "b"]
        ]),
        ["a"]
      )
    ).toBe("b")
    expect(primaryModel(new Map(), ["gemini-3.8-flash@low"])).toBe("gemini-3.8-flash")
    expect(primaryModel(new Map(), [])).toBe("")
  })
})

describe("unpublishable", () => {
  const step = (error?: string) => ({ spec: "a", sent: 10, failed: [{ id: 1, errors: ["request", "request"] }], seconds: 1, error })

  it("未訳の断片が5%以下なら公開してよい", () => {
    expect(unpublishable([], 1, 20)).toBeUndefined()
    expect(unpublishable([], 0, 0)).toBeUndefined()
  })

  it("5%を超えたら公開しない。モデルを呼べなかったことが原因なら、やり直せる", () => {
    expect(unpublishable([step()], 2, 20)).toStrictEqual({ reason: "2 of 20 segments untranslated", retry: false })
    expect(unpublishable([step("request: HTTP 503")], 2, 20)).toStrictEqual({ reason: "2 of 20 segments untranslated", retry: true })
    expect(unpublishable([step("request: HTTP 503"), step("quota")], 2, 20)).toStrictEqual({ reason: "quota", retry: true })
  })

  it("手順を、落ちた理由の内訳つきの1行にする", () => {
    expect(describeStep(step("quota"))).toBe('a: sent 10, failed 1, 1s, quota, {"request":2}')
    expect(describeStep({ ...step(), failed: [] })).toBe("a: sent 10, failed 0, 1s, ok, {}")
  })
})
