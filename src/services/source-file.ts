import { Effect, Option } from "effect"
import type { PageRef } from "../core/source.ts"
import { SourceRepository } from "./ports.ts"

// 原文のファイルがあるかどうかだけを扱う。WorkerはMarkdownの解析を読み込まずに、これだけを使う。

/** 候補のファイルを順に読み、最初に見つかったものを返す。 */
export const readFirst = Effect.fn("readFirst")(function* (repo: string, revision: string, files: ReadonlyArray<string>) {
  const repository = yield* SourceRepository
  for (const file of files) {
    const text = yield* repository.read(repo, revision, file)
    if (Option.isSome(text)) {
      return Option.some({ file, text: text.value })
    }
  }
  return Option.none<{ readonly file: string; readonly text: string }>()
})

/** ページの原文が、原文のリポジトリにあるか。打ち間違いのURLを列に入れないために確かめる。 */
export const sourceExists = Effect.fn("sourceExists")(function* (ref: PageRef) {
  return Option.isSome(yield* readFirst(ref.source.repo, ref.source.branch, ref.source.candidates(ref.path)))
})
