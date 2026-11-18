import { Effect, Option } from "effect"
import { keybindingFile, keybindingTable } from "../core/keybinding.ts"
import { expandLiquid, featureEnabled, frontMatterTitle, isSatisfied, type LiquidData, type LiquidNeeds } from "../core/liquid.ts"
import { splitFrontMatter } from "../core/page.ts"
import type { Keybinding } from "../core/segment.ts"
import { pageId, type PageRef, type Source } from "../core/source.ts"
import { variableFile, variableFilePath, variablePaths, variableResolver } from "../core/variables.ts"
import { SourceNotFound } from "./errors.ts"
import { SourceRepository } from "./ports.ts"
import { readFirst } from "./source-file.ts"

/** 取得した原文。 */
interface FetchedSource {
  /** 原文のリポジトリの中のファイル。 */
  readonly file: string
  readonly text: string
  /** 取得した時点の、原文のブランチのコミット。取得できなければ`undefined`。 */
  readonly commit: string | undefined
  /** 原文と、原文が参照するファイルを読む版。コミットが分かればコミット、分からなければブランチ。 */
  readonly revision: string
}

/** ページの原文を、原文のリポジトリの最新のコミットから取得する。 */
export const fetchSource = Effect.fn("fetchSource")(function* (ref: PageRef) {
  const { source } = ref
  const commit = yield* (yield* SourceRepository).latestCommit(source.repo, source.branch)
  const revision = Option.getOrElse(commit, () => source.branch)
  const found = yield* readFirst(source.repo, revision, source.candidates(ref.path))
  if (Option.isNone(found)) {
    return yield* new SourceNotFound({ page: pageId(source.host, ref.path) })
  }
  const fetched: FetchedSource = { ...found.value, commit: Option.getOrUndefined(commit), revision }
  return fetched
})

// Liquidの展開に足りない値を、原文のリポジトリから取得して足す。
// 原文のリポジトリへの問い合わせが一度に集中しないよう、1つずつ取得する。
const fetchNeeds = Effect.fn("fetchNeeds")(function* (source: Source, revision: string, data: LiquidData, needs: LiquidNeeds) {
  const repository = yield* SourceRepository
  const read = (file: string) => repository.read(source.repo, revision, file).pipe(Effect.map(Option.getOrUndefined))
  const features = new Map(data.features)
  const reusables = new Map(data.reusables)
  const titles = new Map(data.titles)
  for (const name of needs.features) {
    features.set(name, featureEnabled(yield* read(`data/features/${name}.yml`)))
  }
  for (const path of needs.reusables) {
    reusables.set(path, yield* read(`data/reusables/${path}.md`))
  }
  for (const path of needs.titles) {
    const page = yield* readFirst(source.repo, revision, source.candidates(path.replaceAll(/^\/+|\/+$/g, "")))
    titles.set(path, Option.getOrUndefined(Option.map(page, ({ text }) => frontMatterTitle(text))))
  }
  const next: LiquidData = { features, reusables, titles }
  return next
})

// 部品の中の部品、部品の中の条件分岐と、足りない値は段階的に分かる。部品の深さの上限より多く回れば足りる。
const MAX_ROUNDS = 10

/**
 * GitHub Docsの原文のLiquidを、読者の版(fpt)で展開する。フロントマターは展開しない。
 *
 * 展開は純関数で、足りない値のキーを返す。足りない値を取得して、足りなくなくなるまで展開し直す。
 */
export const expandGithubLiquid = Effect.fn("expandGithubLiquid")(function* (text: string, source: Source, revision: string) {
  const { front, body } = splitFrontMatter(text)
  const prefix = front === undefined ? "" : `---\n${front}\n---\n`
  let data: LiquidData = { features: new Map(), reusables: new Map(), titles: new Map() }
  for (let round = 0; round < MAX_ROUNDS; round += 1) {
    const expanded = expandLiquid(body, data)
    if (isSatisfied(expanded.needs)) {
      return prefix + expanded.text
    }
    data = yield* fetchNeeds(source, revision, data, expanded.needs)
  }
  return prefix + expandLiquid(body, data).text
})

/** 原文に出てくる`{% data variables.… %}`の値を引く関数を作る。変数のファイルは、出てくるものだけを取得する。 */
export const loadVariables = Effect.fn("loadVariables")(function* (text: string, source: Source, revision: string) {
  const repository = yield* SourceRepository
  const files = new Map<string, string | undefined>()
  for (const file of new Set(variablePaths(text).map((path) => variableFile(path)))) {
    files.set(file, Option.getOrUndefined(yield* repository.read(source.repo, revision, variableFilePath(file))))
  }
  return variableResolver(files)
})

/** VS Codeの`kb(コマンド)`を、既定のキー割り当てに変える関数を作る。 */
export const loadKeybindings = Effect.fn("loadKeybindings")(function* (source: Source, revision: string) {
  const repository = yield* SourceRepository
  const read = (os: "win" | "osx") => repository.read(source.repo, revision, keybindingFile(os)).pipe(Effect.map(Option.getOrUndefined))
  const table: (command: string) => Keybinding | undefined = keybindingTable(yield* read("win"), yield* read("osx"))
  return table
})
