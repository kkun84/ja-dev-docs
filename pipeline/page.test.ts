import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import type { Nodes } from "mdast";
import { translatePage } from "./page.ts";
import type { Caller } from "./model.ts";

const dir = new URL("./fixtures/", import.meta.url);
const fixtures = readdirSync(dir).filter((f) => f.endsWith(".md"));
const variables = (p: string) => (p === "product.prodname_copilot_short" ? "Copilot" : undefined);
const base = { seed: "test", variables, glossary: {} };

const nothing: Caller = async () => ({ translations: new Map() });
// 断片の文頭に「訳」を付けるだけの偽の翻訳。目印やHTMLタグは保つ。
const fake: Caller = async (_spec, segments) => ({ translations: new Map(segments.map((s) => [s.id, "訳" + s.text])) });

function shape(markdown: string): string[] {
  const body = markdown.replace(/^---\n[\s\S]*?\n---\n/, "");
  const out: string[] = [];
  const walk = (n: Nodes, depth: number) => {
    if (!["text", "inlineCode", "emphasis", "strong", "link", "html", "break"].includes(n.type)) {
      out.push(`${depth}:${n.type}${"depth" in n ? n.depth : ""}${n.type === "code" ? ":" + n.value : ""}${n.type === "table" ? ":" + n.children.length : ""}`);
    }
    if ("children" in n) for (const c of n.children) walk(c as Nodes, depth + 1);
  };
  walk(unified().use(remarkParse).use(remarkGfm).parse(body) as Nodes, 0);
  return out;
}

describe.each(fixtures)("%s", (name) => {
  const text = readFileSync(new URL(name, dir), "utf8");

  it("訳が無ければ本文を原文のまま組み立て直す", async () => {
    const r = await translatePage(text, { ...base, variables: () => undefined, chain: ["x"], call: nothing });
    expect(r.markdown.replace(/^---\n[\s\S]*?\n---\n/, "")).toBe(text.replace(/^---\n[\s\S]*?\n---\n/, ""));
    expect(r.untranslated.length).toBe(r.segments);
  });

  it("訳しても見出し、リスト、表、コードブロックの構造は原文と同じ", async () => {
    const r = await translatePage(text, { ...base, chain: ["x"], call: fake });
    expect(r.untranslated).toEqual([]);
    expect(shape(r.markdown)).toEqual(shape(text));
  });
});

describe("検査", () => {
  it("目印を落とした断片は、次のモデルで訳し直す", async () => {
    const text = "Assign the issue to {% data variables.product.prodname_copilot_short %}. Run `git push` to push.\n";
    const drop: Caller = async (_s, segs) => ({ translations: new Map(segs.map((s) => [s.id, "目印を落とした訳です"])) });
    const r = await translatePage(text, { ...base, chain: ["a", "b"], call: async (spec, segs, legend) => (spec === "a" ? drop(spec, segs, legend) : fake(spec, segs, legend)) });
    expect(r.steps.map((s) => s.failed.length)).toEqual([1, 0]);
    expect(r.usedModel).toEqual({ 1: "b" });
    expect(r.markdown).toBe("訳Assign the issue to Copilot. Run `git push` to push.\n");
  });

  it("対応表には、送る断片に含まれる目印の中身だけを入れる", async () => {
    let seen: Record<string, string> = {};
    const spy: Caller = async (s, segs, legend) => ((seen = legend), fake(s, segs, legend));
    await translatePage("Use {% data variables.product.prodname_copilot_short %} with `code`.\n", { ...base, chain: ["a"], call: spy });
    expect(Object.values(seen).sort()).toEqual(["Copilot", "`code`"]);
  });

  it("用語集に訳語がある変数は、その訳語で戻す", async () => {
    const r = await translatePage("Use {% data variables.product.prodname_copilot_short %} today.\n", { ...base, glossary: { "product.prodname_copilot_short": "コパイロット" }, chain: ["a"], call: fake });
    expect(r.markdown).toBe("訳Use コパイロット today.\n");
  });

  it("日本語と英数字の間の空白を除く", async () => {
    const spaced: Caller = async (_s, segs) => ({ translations: new Map(segs.map((s) => [s.id, "これは Copilot の 10 個目の機能です。"])) });
    const r = await translatePage("This is the tenth feature of Copilot.\n", { ...base, chain: ["a"], call: spaced });
    expect(r.markdown).toBe("これはCopilotの10個目の機能です。\n");
  });

  it("英文のまま返した断片は訳し漏れとして落とす", async () => {
    const echo: Caller = async (_s, segs) => ({ translations: new Map(segs.map((s) => [s.id, s.text])) });
    const r = await translatePage("This sentence has more than four words.\n", { ...base, chain: ["a"], call: echo });
    expect(r.untranslated).toEqual([1]);
  });
});
