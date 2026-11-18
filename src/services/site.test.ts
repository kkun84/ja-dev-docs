import { describe, expect, it } from "@effect/vitest"
import { Cause, Effect, Exit, Option } from "effect"
import { encodeRecord, type TranslationRecord } from "../core/record.ts"
import { testLayer } from "../layers/test/index.ts"
import { StoreFailed } from "./errors.ts"
import { loadTranslations } from "./site.ts"

const record: TranslationRecord = {
  url: "https://code.visualstudio.com/docs/a",
  repo: "microsoft/vscode-docs",
  file: "docs/a.md",
  translatedAt: "2026-01-02T03:04:05.000Z",
  model: "gemini-3.5-flash-lite",
  chain: ["gemini-3.5-flash-lite"],
  segments: 2,
  segmentsByModel: { "gemini-3.5-flash-lite": 2 },
  untranslated: [],
  headings: ["Title", "Section"]
}
const page = "code.visualstudio.com/docs/a"

describe("loadTranslations", () => {
  it.effect("訳文を表示用に整え、記録と組にして返す", () =>
    Effect.gen(function* () {
      const stored = [{ page, markdown: "# 題名\n\n## 節\n\n本文\n", record: encodeRecord(record) }]
      const loaded = yield* loadTranslations().pipe(Effect.provide(testLayer({ stored })))

      expect(loaded).toStrictEqual([
        { page, record, display: { title: "題名", description: undefined, markdown: "\n## 節\n\n本文\n", headings: ["Section"] } }
      ])
    })
  )

  it.effect("記録が決まった形でなければ、どのページかを示して失敗する", () =>
    Effect.gen(function* () {
      const stored = [{ page, markdown: "本文\n", record: "{}" }]
      const exit = yield* Effect.exit(loadTranslations().pipe(Effect.provide(testLayer({ stored }))))

      expect(Exit.isFailure(exit) ? Option.getOrUndefined(Cause.findErrorOption(exit.cause)) : undefined).toBeInstanceOf(StoreFailed)
      expect(Exit.isFailure(exit) ? Option.getOrUndefined(Cause.findErrorOption(exit.cause)) : undefined).toMatchObject({ path: page })
    })
  )
})
