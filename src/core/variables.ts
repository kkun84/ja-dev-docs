/**
 * GitHub Docsの`{% data variables.X.Y %}`の値を、原文のリポジトリの`data/variables/X.yml`から引く。
 */
import { parse as parseYaml } from "yaml"
import { capture } from "./text.ts"

const VARIABLE = /\{%-?\s*data\s+variables\.([\w.-]+)/g

/** 原文に出てくる変数のパス(`product.prodname_copilot`など)。 */
export const variablePaths = (text: string): ReadonlyArray<string> => [...text.matchAll(VARIABLE)].map((match) => capture(match, 1))

/** 変数のパスの先頭。`data/variables/`のファイル名(拡張子なし)になる。 */
export const variableFile = (path: string): string => path.split(".")[0] ?? ""

/** 変数のファイルの、原文のリポジトリでのパス。 */
export const variableFilePath = (file: string): string => `data/variables/${file}.yml`

const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> => typeof value === "object" && value !== null

const parseOrEmpty = (yaml: string | undefined): unknown => {
  try {
    return yaml === undefined ? {} : parseYaml(yaml)
  } catch {
    return {}
  }
}

/**
 * 取得した変数のファイルから、変数のパスを値に変える関数を作る。
 *
 * 値にLiquidが入っているものは、バージョンで変わるので展開しない(`undefined`を返す)。
 */
export const variableResolver = (files: ReadonlyMap<string, string | undefined>): ((path: string) => string | undefined) => {
  const parsed = new Map([...files].map(([file, yaml]) => [file, parseOrEmpty(yaml)]))
  return (path) => {
    const [file = "", ...keys] = path.split(".")
    let node: unknown = parsed.get(file)
    for (const key of keys) {
      node = isRecord(node) ? node[key] : undefined
    }
    return typeof node === "string" && !/\{%|\{\{/.test(node) ? node : undefined
  }
}
