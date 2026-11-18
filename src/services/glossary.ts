import { Effect, Schema } from "effect"
import { parse as parseYaml } from "yaml"
import { StoreFailed } from "./errors.ts"
import { TranslationStore } from "./ports.ts"

// 用語集は、原文のサイトごとの、変数のパスと訳語の表。
const Glossaries = Schema.Record(Schema.String, Schema.Record(Schema.String, Schema.String))
const GLOSSARY_FILE = "data/glossary.yml"

/** 原文のサイトの用語集を読む。変数ごとに、訳文でどう書くかが決めてある。 */
export const loadGlossary = Effect.fn("loadGlossary")(function* (host: string) {
  const yaml = yield* (yield* TranslationStore).glossary
  const parsed = yield* Effect.try({
    try: (): unknown => parseYaml(yaml) ?? {},
    catch: (error) => new StoreFailed({ path: GLOSSARY_FILE, detail: String(error) })
  })
  const glossaries = yield* Schema.decodeUnknownEffect(Glossaries)(parsed).pipe(
    Effect.mapError((issue) => new StoreFailed({ path: GLOSSARY_FILE, detail: String(issue) }))
  )
  return glossaries[host] ?? {}
})
