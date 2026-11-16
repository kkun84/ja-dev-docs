import { describe, expect, it } from "vitest";
import { expandLiquid, type LiquidContext } from "./liquid.ts";

const ctx: LiquidContext = {
  isEnabled: async (n) => ["fpt", "copilot"].includes(n),
  reusable: async (p) => ({ "a/one": "One line.", "a/multi": "First.\n\nSecond.\n", "a/nested": "Has {% data reusables.a.one %}" })[p],
  title: async (p) => (p === "/get-started/x" ? "About X" : undefined),
};

describe("expandLiquid", () => {
  it("読者の版(fpt)でifversionを評価する", async () => {
    expect(await expandLiquid("{% ifversion fpt or ghec %}A{% else %}B{% endif %}", ctx)).toBe("A");
    expect(await expandLiquid("{% ifversion ghes %}A{% elsif copilot %}C{% else %}B{% endif %}", ctx)).toBe("C");
    expect(await expandLiquid("{% ifversion not ghes %}A{% endif %}", ctx)).toBe("A");
    expect(await expandLiquid("{% ifversion ghes > 3.10 %}A{% endif %}x", ctx)).toBe("x");
    expect(await expandLiquid("{% ifversion fpt %}{% ifversion ghes %}A{% else %}B{% endif %}{% endif %}", ctx)).toBe("B");
  });

  it("再利用部品を埋め込み、リストの中では字下げを合わせる", async () => {
    expect(await expandLiquid("{% data reusables.a.nested %}", ctx)).toBe("Has One line.");
    expect(await expandLiquid("1. {% data reusables.a.multi %}\n", ctx)).toBe("1. First.\n\n   Second.\n");
  });

  it("AUTOTITLEをリンク先の題名にし、octiconを除く", async () => {
    expect(await expandLiquid("See [AUTOTITLE](/get-started/x#y). Click {% octicon \"plus\" aria-label=\"plus\" %} Add.", ctx)).toBe("See [About X](/get-started/x#y). Click Add.");
  });

  it("太字の中のアイコンを除いても、太字が崩れない", async () => {
    expect(await expandLiquid("Click **{% octicon \"agent\" aria-label=\"x\" %} Agents** tab.", ctx)).toBe("Click **Agents** tab.");
  });

  it("アイコンが唯一の目的語なら、説明の文字にする", async () => {
    expect(await expandLiquid('Click {% octicon "kebab-horizontal" aria-label="Show options" %}, then Edit.', ctx)).toBe("Click Show options, then Edit.");
  });

  it("{%- と -%} で前後の改行を除き、表が切れない", async () => {
    expect(await expandLiquid("| a | b |\n{%- ifversion ghes %}\n| c | d |\n{%- endif %}\n| e | f |\n", ctx)).toBe("| a | b |\n| e | f |\n");
  });

  it("同じ行の2つの再利用部品と、引用の中の複数行の部品を展開する", async () => {
    expect(await expandLiquid("{% data reusables.a.one %} {% data reusables.a.one %}", ctx)).toBe("One line. One line.");
    expect(await expandLiquid("> {% data reusables.a.multi %}\n", ctx)).toBe("> First.\n>\n> Second.\n");
  });

  it("ツールごとの切り替えは、ツール名を付けて並べる", async () => {
    expect(await expandLiquid("{% webui %}\n\nA\n\n{% endwebui %}\n\n{% cli %}\n\nB\n\n{% endcli %}\n", ctx)).toBe("**Web UI**\n\nA\n\n\n\n**GitHub CLI**\n\nB\n\n\n");
  });

  it("raw の中は展開しない", async () => {
    expect(await expandLiquid("{% raw %}{% ifversion fpt %}{{ x }}{% endraw %}", ctx)).toBe("{% ifversion fpt %}{{ x }}");
  });

  it("変数は残す", async () => {
    expect(await expandLiquid("{% data variables.product.prodname_copilot %}", ctx)).toBe("{% data variables.product.prodname_copilot %}");
  });
});
