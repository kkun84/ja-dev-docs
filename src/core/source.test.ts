import { describe, expect, it } from "vitest"
import { pageId, pageUrl, parsePageUrl, parseSitePath, rawUrl, sourceOf } from "./source.ts"

describe("parsePageUrl", () => {
  it.each([
    ["https://code.visualstudio.com/docs/agents/overview", "code.visualstudio.com", "docs/agents/overview", "docs/agents/overview.md"],
    ["code.visualstudio.com/docs/agents/overview/", "code.visualstudio.com", "docs/agents/overview", "docs/agents/overview.md"],
    ["https%3A%2F%2Fcode.visualstudio.com%2Fupdates%2Fv1_147", "code.visualstudio.com", "updates/v1_147", "release-notes/v1_147.md"],
    [
      "https://docs.github.com/en/get-started/learning-about-github/access-permissions-on-github",
      "docs.github.com",
      "en/get-started/learning-about-github/access-permissions-on-github",
      "content/get-started/learning-about-github/access-permissions-on-github.md"
    ],
    ["docs.github.com/free-pro-team@latest/copilot", "docs.github.com", "en/copilot", "content/copilot.md"],
    ["docs.github.com/copilot/", "docs.github.com", "en/copilot", "content/copilot.md"],
    ["docs.github.com", "docs.github.com", "en", "content/index.md"],
    ["code.visualstudio.com/release-notes/v1_147", "code.visualstudio.com", "updates/v1_147", "release-notes/v1_147.md"]
  ])("%sを正規化する", (input, host, path, file) => {
    const ref = parsePageUrl(input)

    expect(ref?.source.host).toBe(host)
    expect(ref?.path).toBe(path)
    expect(ref?.source.candidates(path)[0]).toBe(file)
  })

  it.each([
    ["対象外のサイト", "https://example.com/docs"],
    ["Enterpriseの版", "docs.github.com/en/enterprise-server@9.9.9.9/copilot/x"],
    ["リポジトリの外を指すパス", "code.visualstudio.com/docs%2F..%2F..%2Fowner%2Frepo%2Fmain%2Ffile"],
    ["使えない文字", "code.visualstudio.com/docs/a b"],
    ["不正なURLエンコード", "code.visualstudio.com/docs/%E0%A4%A"],
    ["不正なURLエンコードで始まるURL", "https%3A%E0%A4%A"],
    ["長すぎるパス", `code.visualstudio.com/${"a".repeat(301)}`]
  ])("%sは受け付けない", (_name, input) => {
    expect(parsePageUrl(input)).toBeUndefined()
  })
})

describe("parseSitePath", () => {
  it("ブラウザが//を1つにまとめた形も受け付ける", () => {
    expect(parseSitePath("/https:/code.visualstudio.com/docs/a")?.path).toBe("docs/a")
    expect(parseSitePath("/https://code.visualstudio.com/docs/a")?.path).toBe("docs/a")
    expect(parseSitePath("/code.visualstudio.com/docs/a")?.path).toBe("docs/a")
    expect(parseSitePath("/favicon.ico")).toBeUndefined()
  })
})

describe("ページの名前とURL", () => {
  it("ページの場所は、原文のURLからhttps://を除いたもの", () => {
    expect(pageId("docs.github.com", "en/copilot")).toBe("docs.github.com/en/copilot")
    expect(pageId("docs.github.com", "")).toBe("docs.github.com")
  })

  it("原文のURLと、リポジトリのファイルのURLを作る", () => {
    const ref = parsePageUrl("code.visualstudio.com/docs/a")

    expect(ref === undefined ? "" : pageUrl(ref)).toBe("https://code.visualstudio.com/docs/a")
    expect(rawUrl("microsoft/vscode-docs", "abc", "docs/a.md")).toBe(
      "https://raw.githubusercontent.com/microsoft/vscode-docs/abc/docs/a.md"
    )
    expect(sourceOf("code.visualstudio.com")?.candidates("docs/a")).toStrictEqual(["docs/a.md", "docs/a/index.md"])
    expect(sourceOf("example.com")).toBeUndefined()
  })
})
