import { mkdir, readdir, readFile, writeFile } from "node:fs/promises"
import { dirname, join, relative, sep } from "node:path"
import { Effect, Layer } from "effect"
import { StoreFailed } from "../../services/errors.ts"
import { TranslationStore, type StoredTranslation } from "../../services/ports.ts"

export interface StoreOptions {
  /** 訳文を置くディレクトリ。`<ホスト>/<パス>/<モデル>.md`が訳文、同じ名前の`.json`がその記録。 */
  readonly directory: string
  /** 用語集のファイル。 */
  readonly glossary: string
}

const attempt = <A>(path: string, run: () => Promise<A>): Effect.Effect<A, StoreFailed> =>
  Effect.tryPromise({ try: run, catch: (error) => new StoreFailed({ path, detail: String(error) }) })

/** 訳文と用語集を、リポジトリのファイルとして読み書きする。 */
export const translationStoreLayer = (options: StoreOptions): Layer.Layer<TranslationStore> => {
  const write = (path: string, markdown: string, record: string) =>
    attempt(path, async () => {
      const base = join(options.directory, path)
      await mkdir(dirname(base), { recursive: true })
      await writeFile(`${base}.md`, markdown)
      await writeFile(`${base}.json`, record)
    })

  const read = (json: string): Promise<StoredTranslation> =>
    Promise.all([readFile(json.replace(/\.json$/, ".md"), "utf8"), readFile(json, "utf8")]).then(([markdown, record]) => ({
      page: relative(options.directory, json).split(sep).slice(0, -1).join("/"),
      markdown,
      record
    }))

  const list = attempt(options.directory, async () => {
    // 訳文がまだ1つも無ければ、ディレクトリも無い。
    const files = await readdir(options.directory, { recursive: true }).catch(() => [])
    const records = files.filter((file) => file.endsWith(".json")).toSorted()
    return Promise.all(records.map((file) => read(join(options.directory, file))))
  })

  return Layer.succeed(TranslationStore, { write, list, glossary: attempt(options.glossary, () => readFile(options.glossary, "utf8")) })
}
