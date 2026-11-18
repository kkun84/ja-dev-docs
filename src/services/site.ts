import { Effect } from "effect"
import { decodeRecord, type TranslationRecord } from "../core/record.ts"
import { displayPage, type DisplayPage } from "../core/site.ts"
import { StoreFailed } from "./errors.ts"
import { TranslationStore } from "./ports.ts"

/** サイトに載せる訳文1つ。 */
export interface LoadedTranslation {
  /** ページの場所。 */
  readonly page: string
  readonly record: TranslationRecord
  readonly display: DisplayPage
}

/** 保存してある訳文をすべて読み、記録を確かめ、表示用に整える。記録が決まった形でなければ失敗する。 */
export const loadTranslations = Effect.fn("loadTranslations")(function* () {
  const stored = yield* (yield* TranslationStore).list
  return yield* Effect.forEach(stored, ({ page, markdown, record: json }) =>
    decodeRecord(json).pipe(
      Effect.mapError((issue) => new StoreFailed({ path: page, detail: String(issue) })),
      Effect.map((record): LoadedTranslation => ({ page, record, display: displayPage(markdown, record.headings) }))
    )
  )
})
