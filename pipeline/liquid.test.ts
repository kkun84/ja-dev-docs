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

  it("raw の中は展開しない", async () => {
    expect(await expandLiquid("{% raw %}{% ifversion fpt %}{{ x }}{% endraw %}", ctx)).toBe("{% ifversion fpt %}{{ x }}");
  });

  it("変数は残す", async () => {
    expect(await expandLiquid("{% data variables.product.prodname_copilot %}", ctx)).toBe("{% data variables.product.prodname_copilot %}");
  });
});
