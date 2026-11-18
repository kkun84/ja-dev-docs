import { describe, expect, it } from "vitest"
import { rewriteHtmlLinks } from "./links.ts"

const vscode = { url: "https://code.visualstudio.com/docs/agents/overview", file: "docs/agents/overview.md" }
const notes = { url: "https://code.visualstudio.com/updates/v1_147", file: "release-notes/v1_147.md" }
const github = { url: "https://docs.github.com/en/copilot/x", file: "content/copilot/x.md" }
const translated = new Set([
  "code.visualstudio.com/docs/agents/quickstart",
  "code.visualstudio.com/updates/v1_146",
  "docs.github.com/en/copilot/y"
])

describe("rewriteHtmlLinks", () => {
  it("訳があるページはこのサイトへ、無いページは原文のサイトへ", () => {
    expect(
      rewriteHtmlLinks('<a href="/docs/agents/quickstart.md#x">a</a><a href="../editing/codebasics.md">b</a>', vscode, translated)
    ).toBe(
      '<a href="/code.visualstudio.com/docs/agents/quickstart#x">a</a><a href="https://code.visualstudio.com/docs/editing/codebasics">b</a>'
    )
    expect(rewriteHtmlLinks('<a href="/copilot/y">a</a> <a href="/copilot/z#k">b</a>', github, translated)).toBe(
      '<a href="/docs.github.com/en/copilot/y">a</a> <a href="https://docs.github.com/en/copilot/z#k">b</a>'
    )
  })

  it("リリースノートとindexは、サイトのURLの形にする", () => {
    expect(rewriteHtmlLinks('<a href="v1_146.md">a</a><a href="/docs/setup/index.md">b</a>', notes, translated)).toBe(
      '<a href="/code.visualstudio.com/updates/v1_146">a</a><a href="https://code.visualstudio.com/docs/setup">b</a>'
    )
  })

  it("画像と動画は原文のサイトの配信元から読む", () => {
    expect(rewriteHtmlLinks('<img src="images/a/b.png" alt="x">', vscode, translated)).toBe(
      '<img src="https://code.visualstudio.com/assets/docs/agents/a/b.png" alt="x">'
    )
    expect(rewriteHtmlLinks('<video src="images/v.mp4">', vscode, translated)).toBe(
      '<video src="https://code.visualstudio.com/assets/docs/agents/v.mp4">'
    )
    expect(rewriteHtmlLinks('<img src="images/1_147/g.png">', notes, translated)).toBe(
      '<img src="https://code.visualstudio.com/assets/updates/1_147/g.png">'
    )
    expect(rewriteHtmlLinks('<img src="/assets/images/a.png">', github, translated)).toBe(
      '<img src="https://docs.github.com/assets/images/a.png">'
    )
    expect(rewriteHtmlLinks("<a href='/docs/files/sample.zip'>z</a>", vscode, translated)).toBe(
      '<a href="https://code.visualstudio.com/docs/files/sample.zip">z</a>'
    )
  })

  it("コードの中の文字や、http以外のスキームは書き換えない", () => {
    const code = '<pre><code>handlers[name](event); &#x3C;a href="/api"></code></pre>'

    expect(rewriteHtmlLinks(code, vscode, translated)).toBe(code)
    expect(rewriteHtmlLinks('<a href="vscode:extension/ms-python.python">x</a>', vscode, translated)).toBe(
      '<a href="vscode:extension/ms-python.python">x</a>'
    )
    expect(rewriteHtmlLinks('<a href="#top">x</a><a href="">y</a>', vscode, translated)).toBe('<a href="#top">x</a><a href="">y</a>')
    expect(rewriteHtmlLinks('<a href="//example.com/x">x</a>', vscode, translated)).toBe('<a href="https://example.com/x">x</a>')
  })

  it("原文のサイトへの絶対URLも、訳があれば書き換える", () => {
    expect(rewriteHtmlLinks('<a href="https://code.visualstudio.com/docs/agents/quickstart">a</a>', vscode, translated)).toBe(
      '<a href="/code.visualstudio.com/docs/agents/quickstart">a</a>'
    )
  })

  it("文字参照を解釈してから書き換え、属性の値として書き戻す", () => {
    expect(rewriteHtmlLinks('<a href="https://example.com/?a=1&amp;b=&#34;x&#x22;">a</a>', vscode, translated)).toBe(
      '<a href="https://example.com/?a=1&amp;b=&quot;x&quot;">a</a>'
    )
  })

  it("GitHub Docsの相対リンクと、対象外のサイトのページのリンクはそのまま", () => {
    expect(rewriteHtmlLinks('<a href="relative/path">a</a>', github, translated)).toBe('<a href="relative/path">a</a>')
    expect(rewriteHtmlLinks('<a href="/x">a</a>', { url: "https://example.com/a", file: "a.md" }, translated)).toBe('<a href="/x">a</a>')
  })
})
