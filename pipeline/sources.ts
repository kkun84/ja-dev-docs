// 原文のサイトのURLと、原文のリポジトリのファイルを対応させる。

import { parse as parseYaml } from "yaml";

export interface Source {
  host: string;
  repo: string;
  branch: string;
  // URLのパスを、このサイトでのページの名前に正規化する。受け付けないURLは undefined。
  canonical(path: string): string | undefined;
  // 正規化したパスから、候補になるリポジトリ内のファイルを返す。先に見つかったものを使う。
  candidates(path: string): string[];
}

export const SOURCES: Record<string, Source> = {
  "code.visualstudio.com": {
    host: "code.visualstudio.com",
    repo: "microsoft/vscode-docs",
    branch: "main",
    canonical(path) {
      // リリースノートは、リポジトリの release-notes/v1_147 とサイトの updates/v1_147 を同じページとして扱う。
      return path.replace(/^release-notes\//, "updates/").replace(/\.md$/, "");
    },
    candidates(path) {
      const updates = /^updates\/(v\d+_\d+)$/.exec(path);
      if (updates) return [`release-notes/${updates[1]}.md`];
      return [`${path}.md`, `${path}/index.md`];
    },
  },
  "docs.github.com": {
    host: "docs.github.com",
    repo: "github/docs",
    branch: "main",
    canonical(path) {
      // 言語は en に揃える。版は github.com(free-pro-team)だけを受け付ける。
      // Enterpriseの版は本文の条件分岐が違うので、今は訳さない。
      let p = path.replace(/^en(\/|$)/, "");
      if (/^enterprise-(server|cloud)@/.test(p)) return undefined;
      p = p.replace(/^free-pro-team@latest(\/|$)/, "");
      return p ? `en/${p}` : "en";
    },
    candidates(path) {
      const p = path.replace(/^en(\/|$)/, "");
      return p ? [`content/${p}.md`, `content/${p}/index.md`] : ["content/index.md"];
    },
  },
};

export interface PageRef {
  source: Source;
  // 正規化したURLのパス。先頭と末尾の / は無い。ページの名前と、翻訳ファイルの置き場所に使う。
  path: string;
}

// パスに使ってよい文字。. や .. だけの区間は認めない(原文のリポジトリの外や、content/ の外を指させないため)。
const SAFE_PATH_RE = /^[A-Za-z0-9@_-][A-Za-z0-9@._-]*(\/[A-Za-z0-9@_-][A-Za-z0-9@._-]*)*$/;
const MAX_PATH_LENGTH = 300;

// 原文のURL(https:// の有無、URLエンコードを問わない)を解釈し、ページの名前に正規化する。
// 同じページを別の名前で列に入れられないよう、表記の揺れはここで1つにまとめる。
export function parsePageUrl(input: string): PageRef | undefined {
  let s = input.trim();
  try {
    if (/^https?%3A/i.test(s)) s = decodeURIComponent(s);
    if (!/^https?:\/\//.test(s)) s = "https://" + s;
    const url = new URL(s);
    const source = SOURCES[url.hostname];
    if (!source) return undefined;
    const raw = trim(decodeURIComponent(url.pathname));
    if (raw.length > MAX_PATH_LENGTH || (raw && !SAFE_PATH_RE.test(raw)) || raw.split("/").some((seg) => /^\.+$/.test(seg))) return undefined;
    const path = source.canonical(raw);
    return path === undefined ? undefined : { source, path };
  } catch {
    // 不正な % などで解釈できないURL。
    return undefined;
  }
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
