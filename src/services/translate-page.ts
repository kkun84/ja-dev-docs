import { Clock, Effect } from "effect"
import { planPage, renderPage, unresolvedLiquid, untranslatedIds } from "../core/page.ts"
import { isoTime } from "../core/queue.ts"
import {
  countByModel,
  describeStep,
  encodeRecord,
  primaryModel,
  translationPath,
  unpublishable,
  type TranslationRecord
} from "../core/record.ts"
import { pageUrl, type PageRef } from "../core/source.ts"
import { PageNotPublishable } from "./errors.ts"
import { loadGlossary } from "./glossary.ts"
import { TranslationStore } from "./ports.ts"
import { expandGithubLiquid, fetchSource, loadKeybindings, loadVariables } from "./source.ts"
import { translateSegments } from "./translate-segments.ts"

/** 1ページを訳した結果の要約。ログに出す。 */
interface PageSummary {
  readonly url: string
  readonly model: string
  readonly segments: number
  readonly segmentsByModel: Readonly<Record<string, number>>
  readonly untranslated: number
}

/**
 * 1ページを訳し、訳文と記録を書く。
 *
 * 原文を取得し、骨組みを保ったまま文の断片だけをモデルで訳し、検査して組み立てる。
 * 訳せなかった断片が多いページは書かずに、`PageNotPublishable`で失敗する。
 */
export const translatePage = Effect.fn("translatePage")(function* (ref: PageRef, chain: ReadonlyArray<string>) {
  const { source } = ref
  const fetched = yield* fetchSource(ref)
  const isGithub = source.host === "docs.github.com"
  const text = isGithub ? yield* expandGithubLiquid(fetched.text, source, fetched.revision) : fetched.text
  const variables = yield* loadVariables(text, source, fetched.revision)
  const keybinding = source.host === "code.visualstudio.com" ? yield* loadKeybindings(source, fetched.revision) : undefined
  const translatedAt = isoTime(yield* Clock.currentTimeMillis)

  const plan = planPage(text, { seed: `${source.host}/${ref.path}/${translatedAt}`, variables, keybinding })
  const { done, usedModel, steps } = yield* translateSegments(plan, chain)
  const untranslated = untranslatedIds(plan, done)

  const problem = unpublishable(steps, untranslated.length, plan.segments.length)
  if (problem !== undefined) {
    yield* Effect.logWarning(`not publishable: ${pageUrl(ref)}`, ...steps.map((step) => describeStep(step)))
    return yield* new PageNotPublishable(problem)
  }

  const model = primaryModel(usedModel, chain)
  const record: TranslationRecord = {
    url: pageUrl(ref),
    repo: source.repo,
    file: fetched.file,
    commit: fetched.commit,
    translatedAt,
    model,
    chain,
    segments: plan.segments.length,
    segmentsByModel: countByModel(usedModel),
    untranslated,
    headings: plan.body.headings,
    unresolvedLiquid: unresolvedLiquid(text),
    steps
  }
  const markdown = renderPage(plan, done, { glossary: yield* loadGlossary(source.host), keybinding })
  yield* (yield* TranslationStore).write(translationPath(source.host, ref.path, model), markdown, encodeRecord(record))

  const summary: PageSummary = {
    url: record.url,
    model,
    segments: record.segments,
    segmentsByModel: record.segmentsByModel,
    untranslated: untranslated.length
  }
  return summary
})
