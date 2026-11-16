import { describe, expect, it } from "vitest";
import { parsePageUrl } from "./sources.ts";

describe("parsePageUrl", () => {
  it.each([
    ["https://code.visualstudio.com/docs/agents/overview", "code.visualstudio.com", "docs/agents/overview", "docs/agents/overview.md"],
    ["code.visualstudio.com/docs/agents/overview/", "code.visualstudio.com", "docs/agents/overview", "docs/agents/overview.md"],
    ["https%3A%2F%2Fcode.visualstudio.com%2Fupdates%2Fv1_147", "code.visualstudio.com", "updates/v1_147", "release-notes/v1_147.md"],
    ["https://docs.github.com/en/get-started/learning-about-github/access-permissions-on-github", "docs.github.com", "en/get-started/learning-about-github/access-permissions-on-github", "content/get-started/learning-about-github/access-permissions-on-github.md"],
    ["docs.github.com/en/enterprise-cloud@latest/copilot", "docs.github.com", "en/enterprise-cloud@latest/copilot", "content/copilot.md"],
  ])("%s", (input, host, path, file) => {
    const ref = parsePageUrl(input)!;
    expect(ref.source.host).toBe(host);
    expect(ref.path).toBe(path);
    expect(ref.source.candidates(ref.path)[0]).toBe(file);
  });

  it("対象外のサイトは受け付けない", () => {
    expect(parsePageUrl("https://example.com/docs")).toBeUndefined();
  });
});
