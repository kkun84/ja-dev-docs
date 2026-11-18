import { readdirSync, readFileSync } from "node:fs"
import type { Nodes } from "mdast"
import { describe, expect, it } from "vitest"
import { parseMarkdown } from "./markdown.ts"
import { tokenIds } from "./mask.ts"
import {
  judge,
  legendFor,
  planPage,
  renderPage,
  splitFrontMatter,
  unresolvedLiquid,
  untranslatedIds,
  type PlanOptions,
  type RenderOptions
} from "./page.ts"
import type { Keybinding, Segment } from "./segment.ts"

const directory = new URL("../../test/fixtures/", import.meta.url)
const fixtures = readdirSync(directory).filter((name) => name.endsWith(".md") && name !== "README.md")

type Translate = (segments: ReadonlyArray<Segment>) => ReadonlyMap<number, string>

// 断片の文頭に「訳」を付けるだけの偽の翻訳。目印やHTMLタグは保つ。
// HTMLの行では、先頭のタグの後ろに付ける(本物の訳も、先頭のタグはそのまま残す)。
const fake: Translate = (segments) => new Map(segments.map((segment) => [segment.id, segment.text.replace(/^((?:<[^>]+>)*)/, "$1訳")]))
const nothing: Translate = () => new Map()
const echo: Translate = (segments) => new Map(segments.map((segment) => [segment.id, segment.text]))
const constant =
  (text: string): Translate =>
  (segments) =>
    new Map(segments.map((segment) => [segment.id, text]))

// 値を決められない変数や、割り当ての無いコマンド。
const NO_VALUES: ReadonlyMap<string, string> = new Map()
const NO_KEYS: ReadonlyMap<string, Keybinding> = new Map()
const unknownVariable = (path: string): string | undefined => NO_VALUES.get(path)
const unknownCommand = (command: string): Keybinding | undefined => NO_KEYS.get(command)
const keybinding = (): Keybinding => ({ win: "Ctrl+Shift+P", mac: "⇧⌘P" })

const variables = (path: string): string | undefined => (path === "product.prodname_copilot_short" ? "Copilot" : undefined)

const run = (text: string, translate: Translate, options: Partial<PlanOptions & RenderOptions> = {}) => {
  const plan = planPage(text, { seed: "test", variables, ...options })
  const verdict = judge(plan, plan.segments, translate(plan.segments))
  return {
    plan,
    verdict,
    markdown: renderPage(plan, verdict.accepted, { glossary: {}, ...options }),
    untranslated: untranslatedIds(plan, verdict.accepted)
  }
}

const SHAPELESS: ReadonlySet<string> = new Set(["text", "inlineCode", "emphasis", "strong", "link", "html", "break"])

const describeNode = (node: Nodes, depth: number): string => {
  const level = "depth" in node ? String(node.depth) : ""
  const code = node.type === "code" ? `:${node.value}` : ""
  const rows = node.type === "table" ? `:${node.children.length}` : ""
  return `${depth}:${node.type}${level}${code}${rows}`
}

// 見出し、リスト、表、コードブロックの並び。文の中身は含めない。
const shape = (markdown: string): ReadonlyArray<string> => {
  const walk = (node: Nodes, depth: number): ReadonlyArray<string> => [
    ...(SHAPELESS.has(node.type) ? [] : [describeNode(node, depth)]),
    ...("children" in node ? node.children.flatMap((child) => walk(child, depth + 1)) : [])
  ]
  return walk(parseMarkdown(splitFrontMatter(markdown).body), 0)
}

describe.each(fixtures)("%s", (name) => {
  const text = readFileSync(new URL(name, directory), "utf8")

  it("訳が無ければ本文を原文のまま組み立て直す", () => {
    const result = run(text, nothing, { variables: unknownVariable })

    expect(splitFrontMatter(result.markdown).body).toBe(splitFrontMatter(text).body)
    expect(result.untranslated).toHaveLength(result.plan.segments.length)
  })

  it("訳しても見出し、リスト、表、コードブロックの構造は原文と同じ", () => {
    const result = run(text, fake)

    expect(result.untranslated).toStrictEqual([])
    expect(shape(result.markdown)).toStrictEqual(shape(text))
  })
})

describe("モデルの出力を信用しない", () => {
  it.each([
    ["引用になる", "This is a sentence with words.\n", "> これは文です。", "block structure"],
    ["リストになる", "This is a sentence with words.\n", "1. Foo これは文です。", "block structure"],
    ["リンクを足す", "This is a sentence with words.\n", "これは[文](javascript:alert(1))です。", "new link"],
    ["閉じていないタグを足す", "This is a sentence with words.\n", "これは<img src=x onerror=alert(1) 文です。", "html tag"],
    ["改行を足す", "This is a sentence with words.\n", "これは\n文です。", "newline"],
    ["知らない目印を足す", "This is a sentence with words.\n", "これは⟦ZZZZ⟧文です。", "placeholder"],
    ["目印の括弧を壊す", "This is a sentence with words.\n", "これは⟦文です。", "broken placeholder"],
    ["表のセルに|を足す", "| a |\n| - |\n| This is the cell text. |\n", "これは | セルです。", "table pipe"]
  ])("%s訳は採らない", (_name, source, output, error) => {
    const result = run(
      source,
      (segments) => new Map(segments.map((segment) => [segment.id, /sentence|cell/.test(segment.text) ? output : `訳${segment.text}`]))
    )

    expect(result.untranslated).toHaveLength(1)
    expect(result.verdict.failed[0]?.errors).toContain(error)
  })

  it("返ってこなかった断片は、原文のまま残す", () => {
    const result = run("First sentence here.\n\nSecond sentence here.\n", (segments) => new Map(fake(segments.slice(0, 1))))

    expect(result.verdict.failed).toStrictEqual([{ id: 2, errors: ["missing"] }])
    expect(result.markdown).toBe("訳First sentence here.\n\nSecond sentence here.\n")
  })

  it("目印を落とした訳は採らない", () => {
    const result = run("Run `git push` to push.\n", constant("目印を落とした訳です"))

    expect(result.verdict.failed).toStrictEqual([{ id: 1, errors: ["placeholder"] }])
  })

  it("1文字だけ書き間違えた目印は直して採る", () => {
    const result = run("Run `git push` to push.\n", (segments) => {
      const [id = ""] = tokenIds(segments[0]?.text ?? "")
      return new Map([[1, `⟦${id.slice(0, 3)}${id.endsWith("A") ? "B" : "A"}⟧を実行してpushします。`]])
    })

    expect(result.markdown).toBe("`git push`を実行してpushします。\n")
  })

  it("英文のまま返した断片は訳し漏れとして落とす", () => {
    expect(run("This sentence has more than four words.\n", echo).untranslated).toStrictEqual([1])
  })

  it("製品名だけの断片は英語のままでよい", () => {
    expect(run("Visual Studio Code 1.147 (Insiders)\n", echo).untranslated).toStrictEqual([])
  })

  it("リンクだけの断片は、題名を英語のまま残してよい", () => {
    expect(run("* [Roles in an organization](/organizations/roles)\n", echo).untranslated).toStrictEqual([])
  })
})

describe("組み立て", () => {
  it("Setext見出しの下線を残す", () => {
    expect(run("Getting started here\n====\n\nBody text.\n", fake).markdown).toBe("訳Getting started here\n====\n\n訳Body text.\n")
  })

  it("ATX見出しの記号と、閉じの#を残す", () => {
    expect(run("## Getting started ##\n", fake).markdown).toBe("## 訳Getting started ##\n")
  })

  it("<pre>の中は訳さない", () => {
    expect(run("<div>\n<p>Some text here.</p>\n<pre>\nkeep this line\n</pre>\n</div>\n", fake).markdown).toBe(
      "<div>\n<p>訳Some text here.</p>\n<pre>\nkeep this line\n</pre>\n</div>\n"
    )
  })

  it("硬い改行を保つ", () => {
    expect(run("> First line  \n> second line\n", fake).markdown).toBe("> 訳First line  \n> second line\n")
  })

  it("アラートの種類の行を残し、中身だけを訳す", () => {
    expect(run("> [!NOTE]\n> Read this first.\n", fake).markdown).toBe("> [!NOTE]\n> 訳Read this first.\n")
  })

  it("表のセルの中身だけを訳す", () => {
    expect(run("| Name | Use |\n| --- | --- |\n| `a` | Does things |\n", fake).markdown).toBe(
      "| 訳Name | 訳Use |\n| --- | --- |\n| `a` | 訳Does things |\n"
    )
  })

  it("コードブロックとHTMLコメントはそのまま残す", () => {
    const text = "```js\nconst words = 1\n```\n\n<!-- keep this comment -->\n\nSome text here.\n"

    expect(run(text, fake).markdown).toBe(text.replace("Some text", "訳Some text"))
  })

  it("裸のURLの前後の空白を残す", () => {
    const result = run(
      "See https://example.com/docs for the details.\n",
      (segments) => new Map([[1, `詳細は⟦${tokenIds(segments[0]?.text ?? "")[0]}⟧を参照してください。`]])
    )

    expect(result.markdown).toBe("詳細は https://example.com/docs を参照してください。\n")
  })

  it("日本語と英数字の間の空白を除く", () => {
    expect(run("This is the tenth feature of Copilot.\n", constant("これは Copilot の 10 個目の機能です。")).markdown).toBe(
      "これはCopilotの10個目の機能です。\n"
    )
  })

  it("kb()を既定のキー割り当てにする", () => {
    expect(run("Press kb(workbench.action.showCommands) to open it.\n", fake, { keybinding }).markdown).toBe(
      '訳Press <kbd title="macOS: ⇧⌘P">Ctrl+Shift+P</kbd> to open it.\n'
    )
  })

  it("割り当ての無いkb()は、コマンドの名前をコードとして出す", () => {
    expect(run("Press kb(some.command) to open it.\n", fake, { keybinding: unknownCommand }).markdown).toBe(
      "訳Press `some.command` to open it.\n"
    )
  })

  it("変数は値に戻し、用語集に訳語があればその訳語で戻す", () => {
    const text = "Use {% data variables.product.prodname_copilot_short %} today.\n"

    expect(run(text, fake).markdown).toBe("訳Use Copilot today.\n")
    expect(run(text, fake, { glossary: { "product.prodname_copilot_short": "コパイロット" } }).markdown).toBe("訳Use コパイロット today.\n")
  })

  it("値を決められない変数とLiquidのタグは、原文のまま戻す", () => {
    const text = "Use {% data variables.product.unknown %} and {{ site.name }} today.\n"

    expect(run(text, fake).markdown).toBe(`訳${text}`)
  })
})

describe("リンクとHTML", () => {
  it("自動リンクと行内のHTMLタグを保つ", () => {
    expect(run('See <https://example.com/a> and <a href="/docs/x">the guide</a> now.\n', fake).markdown).toBe(
      '訳See <https://example.com/a> and <a href="/docs/x">the guide</a> now.\n'
    )
  })

  it("HTMLタグのリンク先を書き換えた訳は採らない", () => {
    const result = run('Read <a href="/docs/x">the guide</a> now.\n', constant('<a href="https://evil.example/">ガイド</a>を読みます。'))

    expect(result.verdict.failed[0]?.errors).toStrictEqual(["html tag", "new link"])
  })

  it("画像と参照リンクの定義は、参照先を変えない", () => {
    const text = "![Screenshot of the panel](images/panel.png)\n\nSee [the docs][docs] here.\n\n[docs]: https://example.com/docs\n"

    expect(run(text, fake).markdown).toBe(
      "訳![Screenshot of the panel](images/panel.png)\n\n訳See [the docs][docs] here.\n\n[docs]: https://example.com/docs\n"
    )
  })

  it("引用の中のHTMLブロックは、行頭の>を残して行ごとに訳す", () => {
    expect(run("> <div>\n> Some text here.\n> </div>\n", fake).markdown).toBe("> <div>\n> 訳Some text here.\n> </div>\n")
  })

  it("複数行の段落は1つの断片にし、行頭の字下げは渡さない", () => {
    const plan = planPage("- First line of the item\n  second line of the item\n", { seed: "test", variables })

    expect(plan.segments.map((segment) => segment.text)).toStrictEqual(["First line of the item second line of the item"])
  })
})

describe("フロントマター", () => {
  const text = `---\ntitle: About the thing\nshortTitle: 'The thing'\nintro: "Learn about {% data variables.product.prodname_copilot_short %}."\nversions:\n  fpt: '*'\nredirect_from: [a]\nMetaDescription: >-\n---\nBody text here.\n`

  it("訳すキーの1行の値だけを訳し、JSONの文字列として書き戻す", () => {
    expect(run(text, fake).markdown).toBe(
      `---\ntitle: "訳About the thing"\nshortTitle: "訳The thing"\nintro: "訳Learn about Copilot."\nversions:\n  fpt: '*'\nredirect_from: [a]\nMetaDescription: >-\n---\n訳Body text here.\n`
    )
  })

  it("訳せなかった値は原文の行のまま残す", () => {
    expect(run(text, nothing).markdown).toBe(text)
  })

  it("引用符が閉じていない値は訳さない", () => {
    expect(run("---\ntitle: 'broken\n---\nBody text here.\n", fake).markdown).toBe("---\ntitle: 'broken\n---\n訳Body text here.\n")
  })
})

describe("対応表", () => {
  it("送る断片に含まれる目印の中身だけを入れる", () => {
    const plan = planPage("Use {% data variables.product.prodname_copilot_short %} with `code`.\n\nRun `other` now.\n", {
      seed: "test",
      variables
    })

    expect(Object.values(legendFor(plan, plan.segments.slice(0, 1))).toSorted()).toStrictEqual(["Copilot", "`code`"])
    expect(Object.values(legendFor(plan, plan.segments))).toHaveLength(3)
  })
})

describe("unresolvedLiquid", () => {
  it("展開できずに残ったタグの名前を、重複なく返す", () => {
    expect(unresolvedLiquid("{% ifversion x %}{% data variables.a.b %}{% raw %}{% endraw %}{% endif %}{% ifversion y %}")).toStrictEqual([
      "ifversion",
      "endif"
    ])
  })
})
