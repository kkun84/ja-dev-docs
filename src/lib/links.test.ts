import { describe, expect, it } from "vitest";
import { rewriteLinks } from "./links.ts";

const vscode = { url: "https://code.visualstudio.com/docs/agents/overview", repo: "microsoft/vscode-docs", file: "docs/agents/overview.md", commit: "abc" };
const github = { url: "https://docs.github.com/en/copilot/x", repo: "github/docs", file: "content/copilot/x.md" };
const translated = new Set(["code.visualstudio.com/docs/agents/quickstart", "docs.github.com/en/copilot/y"]);

describe("rewriteLinks", () => {
  it("訳があるページはこのサイトへ、無いページは原文のサイトへ", () => {
    expect(rewriteLinks("[a](/docs/agents/quickstart.md#x) [b](../editing/codebasics.md)", vscode, translated)).toBe(
      "[a](/code.visualstudio.com/docs/agents/quickstart#x) [b](https://code.visualstudio.com/docs/editing/codebasics)",
    );
    expect(rewriteLinks("[a](/copilot/y) [b](/copilot/z#k)", github, translated)).toBe("[a](/docs.github.com/en/copilot/y) [b](https://docs.github.com/en/copilot/z#k)");
  });

  it("画像は原文のリポジトリから読む", () => {
    expect(rewriteLinks("![x](images/a/b.png)", vscode, translated)).toBe("![x](https://raw.githubusercontent.com/microsoft/vscode-docs/abc/docs/agents/images/a/b.png)");
    expect(rewriteLinks('<video src="images/v.mp4">', vscode, translated)).toBe('<video src="https://raw.githubusercontent.com/microsoft/vscode-docs/abc/docs/agents/images/v.mp4">');
    expect(rewriteLinks("![x](/assets/images/a.png)", github, translated)).toBe("![x](https://docs.github.com/assets/images/a.png)");
  });

  it("原文のサイトへの絶対URLも、訳があれば書き換える", () => {
    expect(rewriteLinks("[a](https://code.visualstudio.com/docs/agents/quickstart)", vscode, translated)).toBe("[a](/code.visualstudio.com/docs/agents/quickstart)");
    expect(rewriteLinks("[a](https://example.com/x)", vscode, translated)).toBe("[a](https://example.com/x)");
  });
});
