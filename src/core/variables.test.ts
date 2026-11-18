import { describe, expect, it } from "vitest"
import { variableFile, variableFilePath, variablePaths, variableResolver } from "./variables.ts"

describe("変数のパス", () => {
  it("原文に出てくる変数を、出てきた順に返す", () => {
    expect(
      variablePaths("{% data variables.product.prodname_copilot %} and {%- data variables.copilot.cca -%} {% data reusables.a.b %}")
    ).toStrictEqual(["product.prodname_copilot", "copilot.cca"])
  })

  it("パスの先頭がファイルの名前になる", () => {
    expect(variableFile("product.prodname_copilot")).toBe("product")
    expect(variableFilePath("product")).toBe("data/variables/product.yml")
  })
})

describe("variableResolver", () => {
  const resolve = variableResolver(
    new Map<string, string | undefined>([
      [
        "product",
        "prodname_copilot: GitHub Copilot\nnested:\n  name: Nested\nversioned: '{% ifversion ghes %}A{% else %}B{% endif %}'\ncount: 3\n"
      ],
      ["broken", "a: [unclosed"],
      ["missing", undefined]
    ])
  )

  it("ファイルの中の値を引く", () => {
    expect(resolve("product.prodname_copilot")).toBe("GitHub Copilot")
    expect(resolve("product.nested.name")).toBe("Nested")
  })

  it("Liquidを含む値、文字列でない値、無い値は決めない", () => {
    expect(resolve("product.versioned")).toBeUndefined()
    expect(resolve("product.count")).toBeUndefined()
    expect(resolve("product.nested")).toBeUndefined()
    expect(resolve("product.unknown.deep")).toBeUndefined()
    expect(resolve("broken.a")).toBeUndefined()
    expect(resolve("missing.a")).toBeUndefined()
    expect(resolve("never-fetched.a")).toBeUndefined()
  })
})
