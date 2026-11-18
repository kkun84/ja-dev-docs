import { describe, expect, it } from "vitest"
import { expandLiquid, featureEnabled, frontMatterTitle, isSatisfied, type LiquidData } from "./liquid.ts"

const data: LiquidData = {
  features: new Map([
    ["copilot", true],
    ["old-feature", false]
  ]),
  reusables: new Map<string, string | undefined>([
    ["a/one", "One line."],
    ["a/multi", "First.\n\nSecond.\n"],
    ["a/nested", "Has {% data reusables.a.one %}"],
    ["a/loop", "Again {% data reusables.a.loop %}"],
    ["a/gone", undefined]
  ]),
  titles: new Map<string, string | undefined>([
    ["/get-started/x", "About X"],
    ["/get-started/gone", undefined]
  ])
}

const expand = (text: string): string => expandLiquid(text, data).text

describe("expandLiquid", () => {
  it("読者の版(fpt)でifversionを評価する", () => {
    expect(expand("{% ifversion fpt or ghec %}A{% else %}B{% endif %}")).toBe("A")
    expect(expand("{% ifversion ghes %}A{% elsif copilot %}C{% else %}B{% endif %}")).toBe("C")
    expect(expand("{% ifversion not ghes %}A{% endif %}")).toBe("A")
    expect(expand("{% ifversion ghes > 3.10 %}A{% endif %}x")).toBe("x")
    expect(expand("{% ifversion fpt %}{% ifversion ghes %}A{% else %}B{% endif %}{% endif %}")).toBe("B")
    expect(expand("{% ifversion fpt and old-feature %}A{% endif %}x")).toBe("x")
    expect(expand("{% ifversion ??? %}A{% endif %}x")).toBe("x")
  })

  it("対応の取れないendifは残す", () => {
    expect(expand("A{% endif %}B")).toBe("A{% endif %}B")
  })

  it("再利用部品を埋め込み、リストの中では字下げを合わせる", () => {
    expect(expand("{% data reusables.a.nested %}")).toBe("Has One line.")
    expect(expand("1. {% data reusables.a.multi %}\n")).toBe("1. First.\n\n   Second.\n")
  })

  it("自分を含む部品は、決めた深さで展開をやめる", () => {
    expect(expand("{% data reusables.a.loop %}")).toBe(`${"Again ".repeat(5)}{% data reusables.a.loop %}`)
  })

  it("原文に無い部品と題名は、そのまま残す", () => {
    expect(expand("{% data reusables.a.gone %} [AUTOTITLE](/get-started/gone)")).toBe(
      "{% data reusables.a.gone %} [AUTOTITLE](/get-started/gone)"
    )
  })

  it("AUTOTITLEをリンク先の題名にし、octiconを除く", () => {
    expect(expand('See [AUTOTITLE](/get-started/x#y). Click {% octicon "plus" aria-label="plus" %} Add.')).toBe(
      "See [About X](/get-started/x#y). Click Add."
    )
  })

  it("太字の中のアイコンを除いても、太字が崩れない", () => {
    expect(expand('Click **{% octicon "agent" aria-label="x" %} Agents** tab.')).toBe("Click **Agents** tab.")
  })

  it("アイコンが唯一の目的語なら、説明の文字にする", () => {
    expect(expand('Click {% octicon "kebab-horizontal" aria-label="Show options" %}, then Edit.')).toBe("Click Show options, then Edit.")
  })

  it("{%-と-%}で前後の改行を除き、表が切れない", () => {
    expect(expand("| a | b |\n{%- ifversion ghes %}\n| c | d |\n{%- endif %}\n| e | f |\n")).toBe("| a | b |\n| e | f |\n")
  })

  it("同じ行の2つの再利用部品と、引用の中の複数行の部品を展開する", () => {
    expect(expand("{% data reusables.a.one %} {% data reusables.a.one %}")).toBe("One line. One line.")
    expect(expand("> {% data reusables.a.multi %}\n")).toBe("> First.\n>\n> Second.\n")
  })

  it("ツールごとの切り替えは、ツール名を付けて並べる", () => {
    expect(expand("{% webui %}\n\nA\n\n{% endwebui %}\n\n{% cli %}\n\nB\n\n{% endcli %}\n")).toBe(
      "**Web UI**\n\nA\n\n\n\n**GitHub CLI**\n\nB\n\n\n"
    )
  })

  it("表示に関わらない囲みのタグは除き、知らないタグは残す", () => {
    expect(expand("{% note %}\n\nA\n\n{% endnote %}\n{% unknown %}\n{% endunknown %}")).toBe("\n\nA\n\n\n{% unknown %}\n{% endunknown %}")
  })

  it("rawの中は展開しない", () => {
    expect(expand("{% raw %}{% ifversion fpt %}{{ x }}{% endraw %}")).toBe("{% ifversion fpt %}{{ x }}")
  })

  it("変数は残す", () => {
    expect(expand("{% data variables.product.prodname_copilot %}")).toBe("{% data variables.product.prodname_copilot %}")
  })
})

describe("足りない値", () => {
  const empty: LiquidData = { features: new Map(), reusables: new Map(), titles: new Map() }

  it("手元に無い値は展開せずに残し、キーを返す", () => {
    const { text, needs } = expandLiquid("{% ifversion some-feature %}A{% endif %}{% data reusables.a.one %} [AUTOTITLE](/x/y)", empty)

    expect(text).toBe("{% data reusables.a.one %} [AUTOTITLE](/x/y)")
    expect([...needs.features]).toStrictEqual(["some-feature"])
    expect([...needs.reusables]).toStrictEqual(["a/one"])
    expect([...needs.titles]).toStrictEqual(["/x/y"])
    expect(isSatisfied(needs)).toBe(false)
  })

  it("すべて手元にあれば、足りない値は無い", () => {
    expect(isSatisfied(expandLiquid("{% ifversion copilot %}A{% endif %}", data).needs)).toBe(true)
  })
})

describe("原文のリポジトリのファイルの解釈", () => {
  it("機能がfptで有効かを決める", () => {
    expect(featureEnabled("versions:\n  fpt: '*'\n  ghec: '*'\n")).toBe(true)
    expect(featureEnabled("versions:\n  ghes: '>3.10'\n")).toBe(false)
    expect(featureEnabled("- a\n")).toBe(false)
    expect(featureEnabled(new Map<string, string>().get("missing"))).toBe(false)
  })

  it("フロントマターから題名を取り出す", () => {
    expect(frontMatterTitle("---\ntitle: 'About X'\nintro: y\n---\n")).toBe("About X")
    expect(frontMatterTitle("---\ntitle: About X \n---\n")).toBe("About X")
    expect(frontMatterTitle("# no front matter\n")).toBeUndefined()
  })
})
