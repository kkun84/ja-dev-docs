import { describe, expect, it } from "vitest"
import {
  alertsToAsides,
  bookmarklet,
  displayPage,
  finishRendered,
  fixHeadingIds,
  groupPages,
  hostLabel,
  hostOf,
  licenseOf,
  sectionOf,
  sidebar,
  sourceFileUrl,
  stashHeadingIds,
  type VariantLike
} from "./site.ts"

const variant = (page: string, model: string, untranslated: ReadonlyArray<number> = []): VariantLike => ({
  page,
  record: { model, untranslated }
})

describe("groupPages", () => {
  it("ページごとにまとめ、訳せなかった断片が少ない訳を既定にする", () => {
    const pages = groupPages(
      [variant("a", "gemini-3.5-flash-lite", [1]), variant("b", "gemini-3.5-flash-lite"), variant("a", "gemini-3.8-flash")],
      (each) => each
    )

    expect(pages.map((page) => page.id)).toStrictEqual(["a", "b"])
    expect(pages[0]?.primary.record.model).toBe("gemini-3.8-flash")
    expect(pages[0]?.variants).toHaveLength(2)
  })

  it("同じなら、決めた順のモデルを既定にする。知らないモデルは最後", () => {
    const pages = groupPages(
      [variant("a", "unknown"), variant("a", "gemini-3.8-flash"), variant("a", "gemini-3.5-flash-lite")],
      (each) => each
    )

    expect(pages[0]?.variants.map((each) => each.record.model)).toStrictEqual(["gemini-3.5-flash-lite", "gemini-3.8-flash", "unknown"])
  })
})

describe("サイドバー", () => {
  const pages = [
    { id: "code.visualstudio.com/docs/agents/overview", title: "概要" },
    { id: "code.visualstudio.com/docs/agents/a", title: "A" },
    { id: "code.visualstudio.com/docs/editing/x", title: "X" },
    { id: "docs.github.com/en/copilot/y", title: "Y" }
  ]

  it("同じ節のページだけを、場所の順に並べる", () => {
    expect(sidebar(pages, "code.visualstudio.com/docs/agents/overview")).toStrictEqual([
      { label: "訳したページの一覧", link: "/list/" },
      {
        label: "VS Code: docs/agents",
        items: [
          { label: "A", link: "/code.visualstudio.com/docs/agents/a/" },
          { label: "概要", link: "/code.visualstudio.com/docs/agents/overview/" }
        ]
      }
    ])
  })

  it("節とホストの名前", () => {
    expect(sectionOf("docs.github.com/en/copilot/how-tos/x")).toBe("docs.github.com/en/copilot")
    expect(hostOf("docs.github.com/en")).toBe("docs.github.com")
    expect(hostLabel("docs.github.com")).toBe("GitHub Docs")
    expect(hostLabel("example.com")).toBe("example.com")
  })
})

describe("alertsToAsides", () => {
  it("アラートをStarlightの補足にし、中身はMarkdownのまま残す", () => {
    expect(alertsToAsides("before\n> [!NOTE]\n> first **bold**\n>\n> second\n\nafter")).toBe(
      [
        "before",
        '<aside aria-label="メモ" class="starlight-aside starlight-aside--note"><p class="starlight-aside__title" aria-hidden="true">メモ</p><div class="starlight-aside__content">',
        "",
        "first **bold**",
        "",
        "second",
        "",
        "</div></aside>",
        "",
        "after"
      ].join("\n")
    )
  })

  it("リストの中のアラートは、字下げを保つ", () => {
    expect(alertsToAsides("1. step\n   > [!WARNING]\n   > careful\n2. next").split("\n")).toStrictEqual([
      "1. step",
      '   <aside aria-label="警告" class="starlight-aside starlight-aside--caution"><p class="starlight-aside__title" aria-hidden="true">警告</p><div class="starlight-aside__content">',
      "",
      "   careful",
      "",
      "   </div></aside>",
      "2. next"
    ])
  })

  it("ふつうの引用はそのまま", () => {
    expect(alertsToAsides("> quoted\n> text")).toBe("> quoted\n> text")
  })
})

describe("displayPage", () => {
  it("フロントマターの題名と説明を使う", () => {
    const page = displayPage("---\ntitle: \"題名\"\nintro: 'It''s here'\nversions:\n  fpt: \"*\"\n---\n## 節\n\n本文\n", ["Section"])

    expect(page).toStrictEqual({ title: "題名", description: "It's here", markdown: "## 節\n\n本文\n", headings: ["Section"] })
  })

  it("題名が無ければ先頭の見出しを題名にし、本文と見出しの一覧から除く", () => {
    const page = displayPage("---\nOrder: 1\nMetaDescription: 説明\n---\n# 題名 <!-- note -->\n\n## 節\n", ["Title", "Section"])

    expect(page).toStrictEqual({ title: "題名", description: "説明", markdown: "\n## 節\n", headings: ["Section"] })
  })

  it("題名にする見出しから、入れ子や閉じていないHTMLコメントも除く", () => {
    expect(displayPage("# A <!<!-- x -->-- y --> B <!-- open\n", []).title).toBe("A  B  open")
  })

  it("フロントマターも見出しも無ければ、題名は無い", () => {
    expect(displayPage("本文\n", []).title).toBeUndefined()
  })

  it("JSONとして読めない値は、書かれたまま使う", () => {
    expect(displayPage('---\ntitle: "broken\nPageTitle: 予備\n---\n', []).title).toBe('"broken')
    expect(displayPage('---\ntitle: "\\u3042"\n---\n', []).title).toBe("あ")
  })
})

describe("見出しのID", () => {
  it("原文の見出しから作ったIDに書き換え、対応を返す", () => {
    const { html, renamed } = fixHeadingIds('<h2 id="概要">概要</h2><h3 class="x" id="概要-1">概要</h3><h2 id="extra">x</h2>', [
      "Overview",
      "Overview"
    ])

    expect(html).toBe('<h2 id="overview">概要</h2><h3 class="x" id="overview-1">概要</h3><h2 id="extra">x</h2>')
    expect([...renamed]).toStrictEqual([
      ["概要", "overview"],
      ["概要-1", "overview-1"]
    ])
  })

  it("idをdata-idに退避する", () => {
    expect(stashHeadingIds('<h2 id="a">A</h2><p id="b">B</p>')).toBe('<h2 data-id="a">A</h2><p id="b">B</p>')
  })
})

describe("帰属表示", () => {
  it("原文のサイトごとのライセンスを返す", () => {
    expect(licenseOf("https://docs.github.com/en/x").name).toBe("CC BY 4.0")
    expect(licenseOf("https://code.visualstudio.com/docs/x").name).toBe("CC BY 3.0 US")
  })

  it("原文のコミットの時点のファイルのURLを作る", () => {
    expect(sourceFileUrl({ repo: "github/docs", file: "content/x.md", commit: "abc" })).toBe(
      "https://github.com/github/docs/blob/abc/content/x.md"
    )
    expect(sourceFileUrl({ repo: "github/docs", file: "content/x.md", commit: undefined })).toBeUndefined()
  })

  it("ブックマークレットは、開いているページのURLをこのサイトの後ろに付ける", () => {
    expect(bookmarklet("https://ja-dev-docs.keke.works")).toBe(
      String.raw`javascript:location.href='https://ja-dev-docs.keke.works/'+location.href.replace(/^https?:\/\//,'')`
    )
  })
})

describe("finishRendered", () => {
  it("リンクを書き換え、見出しと目次のIDを原文の見出しから作る", () => {
    const rendered = {
      html: '<h2 id="概要">概要</h2><a href="quickstart.md">次へ</a>',
      headings: [
        { depth: 2, slug: "概要", text: "概要" },
        { depth: 3, slug: "その他", text: "その他" }
      ]
    }
    const origin = { url: "https://code.visualstudio.com/docs/agents/overview", file: "docs/agents/overview.md" }

    expect(finishRendered(rendered, origin, ["Overview"], new Set(["code.visualstudio.com/docs/agents/quickstart"]))).toStrictEqual({
      html: '<h2 id="overview">概要</h2><a href="/code.visualstudio.com/docs/agents/quickstart">次へ</a>',
      headings: [
        { depth: 2, slug: "overview", text: "概要" },
        { depth: 3, slug: "その他", text: "その他" }
      ]
    })
  })
})
