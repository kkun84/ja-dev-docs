import { parse as parseYaml } from "yaml";
import type { LiquidContext } from "./liquid.ts";
import { httpFetcher, rawUrl, type Source } from "./sources.ts";

// GitHub Docsの版と機能の判定、再利用部品、リンク先の題名を、原文のリポジトリから引く。
export function githubContext(source: Source): LiquidContext {
  const cache = new Map<string, Promise<string | undefined>>();
  const get = (file: string) => {
    if (!cache.has(file)) cache.set(file, httpFetcher(rawUrl(source, file)));
    return cache.get(file)!;
  };
  return {
    async isEnabled(name) {
      if (name === "fpt") return true;
      if (name === "ghec" || name === "ghes") return false;
      const yml = await get(`data/features/${name}.yml`);
      const versions = yml ? ((parseYaml(yml) ?? {}) as { versions?: Record<string, unknown> }).versions : undefined;
      return Boolean(versions && "fpt" in versions);
    },
    reusable: (path) => get(`data/reusables/${path}.md`),
    async title(path) {
      for (const file of source.candidates(path)) {
        const md = await get(file);
        const m = md && /^title:[ \t]*(.+)$/m.exec(md);
        if (m) return m[1]!.trim().replace(/^(['"])(.*)\1$/, "$2");
      }
      return undefined;
    },
  };
}
