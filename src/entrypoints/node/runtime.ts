import { Effect, Exit, Layer } from "effect"
import { DEFAULT_CHAIN } from "../../core/model.ts"
import { geminiTranslatorLayer } from "../../layers/http/gemini.ts"
import { sourceRepositoryLayer } from "../../layers/http/source-repository.ts"
import { disableFetchTimeouts } from "../../layers/node/fetch.ts"
import { translationStoreLayer } from "../../layers/node/translation-store.ts"
import { describeCause } from "../../services/errors.ts"

/** 訳文を置くディレクトリと、用語集のファイル。リポジトリのルートからの相対パス。 */
export const CONTENT_DIRECTORY = "content"
const GLOSSARY_FILE = "data/glossary.yml"

/** 訳文と用語集を、リポジトリのファイルとして読み書きする層。 */
export const storeLayer = translationStoreLayer({ directory: CONTENT_DIRECTORY, glossary: GLOSSARY_FILE })

/** 原文のリポジトリ、翻訳モデル、訳文の置き場所。CLIと翻訳ジョブで共通。 */
export const translationLayer = (environment: NodeJS.ProcessEnv, apiKey: string) =>
  Layer.mergeAll(
    sourceRepositoryLayer({ fetch, githubToken: environment["GITHUB_TOKEN"] }),
    geminiTranslatorLayer({ apiKey, fetch }),
    storeLayer
  )

/** 訳す順。`--chain`で指定が無ければ既定の順。 */
export const chainOr = (chain: ReadonlyArray<string> | undefined): ReadonlyArray<string> =>
  chain === undefined || chain.length === 0 ? DEFAULT_CHAIN : chain

/**
 * 入口の手順を最後まで動かし、失敗したらその理由を出して、終了コードを1にする。
 *
 * 手順が返した数は、そのまま終了コードにする。
 */
export const runMain = (program: Effect.Effect<number | void, unknown>): void => {
  const main = async (): Promise<void> => {
    const exit = await Effect.runPromiseExit(disableFetchTimeouts.pipe(Effect.andThen(program)))
    if (Exit.isSuccess(exit)) {
      process.exitCode = exit.value ?? 0
    } else {
      process.stderr.write(`${describeCause(exit.cause)}\n`)
      process.exitCode = 1
    }
  }
  void main()
}

/** 必要な環境変数が無いことを伝えて、終了コードを1にする。 */
export const missingEnvironment = (name: string): void => {
  process.stderr.write(`${name} is not set\n`)
  process.exitCode = 1
}
