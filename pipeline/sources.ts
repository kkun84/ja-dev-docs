// 原文のサイトのURLと、原文のリポジトリのファイルを対応させる。

import { parse as parseYaml } from "yaml";

export interface Source {
  host: string;
  repo: string;
  branch: string;
  // URLのパスから、候補になるリポジトリ内のファイルを返す。先に見つかったものを使う。
  candidates(path: string): string[];
}

export const SOURCES: Record<string, Source> = {
  "code.visualstudio.com": {
    host: "code.visualstudio.com",
    repo: "microsoft/vscode-docs",
    branch: "main",
    candidates(path) {
      const p = trim(path);
      const updates = /^updates\/(v\d+_\d+)$/.exec(p);
      if (updates) return [`release-notes/${updates[1]}.md`];
      return [`${p}.md`, `${p}/index.md`];
    },
  },
  "docs.github.com": {
    host: "docs.github.com",
    repo: "github/docs",
    branch: "main",
    candidates(path) {
      // 言語の /en/ と、バージョン(enterprise-cloud@latest など)を除く。
      const p = trim(path).replace(/^en(\/|$)/, "").replace(/^(enterprise-server@[\d.]+|enterprise-cloud@latest|free-pro-team@latest)(\/|$)/, "");
      return p ? [`content/${p}.md`, `content/${p}/index.md`] : ["content/index.md"];
    },
  },
};

export interface PageRef {
  source: Source;
  // URLのパス。先頭と末尾の / を除いたもの。翻訳ファイルの置き場所にも使う。
  path: string;
}

// 原文のURL(https:// の有無、URLエンコードを問わない)を解釈する。
export function parsePageUrl(input: string): PageRef | undefined {
  let s = input.trim();
  if (/^https?%3A/i.test(s)) s = decodeURIComponent(s);
  if (!/^https?:\/\//.test(s)) s = "https://" + s;
  let url: URL;
  try {
    url = new URL(s);
  } catch {
    return undefined;
  }
  const source = SOURCES[url.hostname];
  if (!source) return undefined;
  return { source, path: trim(decodeURIComponent(url.pathname)) };
}

function trim(p: string): string {
  return p.replace(/^\/+|\/+$/g, "");
}

export type Fetcher = (url: string) => Promise<string | undefined>;

export const httpFetcher: Fetcher = async (url) => {
  const res = await fetch(url, { signal: AbortSignal.timeout(60_000) });
  if (res.status === 404) return undefined;
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
};

export function rawUrl(source: Source, file: string): string {
  return `https://raw.githubusercontent.com/${source.repo}/${source.branch}/${file}`;
}

export async function fetchPage(ref: PageRef, fetcher: Fetcher = httpFetcher): Promise<{ file: string; text: string } | undefined> {
  for (const file of ref.source.candidates(ref.path)) {
    const text = await fetcher(rawUrl(ref.source, file));
    if (text !== undefined) return { file, text };
  }
  return undefined;
}

// {% data variables.X.Y %} の値を、原文のリポジトリの data/variables/X.yml から引く。
// 値にLiquidが入っているものは、バージョンで変わるので展開しない(undefinedを返す)。
export async function loadVariables(source: Source, paths: string[], fetcher: Fetcher = httpFetcher): Promise<(path: string) => string | undefined> {
  const files = new Map<string, unknown>();
  for (const p of paths) {
    const file = p.split(".")[0]!;
    if (!files.has(file)) {
      const text = await fetcher(rawUrl(source, `data/variables/${file}.yml`));
      files.set(file, text ? parseYaml(text) : {});
    }
  }
  return (path) => {
    const [file, ...keys] = path.split(".");
    let node: unknown = files.get(file!);
    for (const k of keys) node = node && typeof node === "object" ? (node as Record<string, unknown>)[k] : undefined;
    return typeof node === "string" && !/\{%|\{\{/.test(node) ? node : undefined;
  };
}
