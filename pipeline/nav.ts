// 原文のサイトの目次を、このサイトのサイドバー用のJSONにする。
//
//   node pipeline/nav.ts --vscode <vscode-docsの作業ツリー> --github <github/docsの作業ツリー>
//
// data/nav/<ホスト>.json に、節ごとの木を書く。VS Codeは docs、api、updates の節、GitHub Docsは製品ごとの節。
// 各項目の path は、このサイトでのページの名前(原文のURLのパスから先頭の / を除いたもの)。

import { readFileSync, readdirSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { parse as parseYaml } from "yaml";

export interface NavItem {
  title: string;
  path?: string;
  children?: NavItem[];
}

const { values } = parseArgs({ options: { vscode: { type: "string" }, github: { type: "string" }, out: { type: "string", default: "data/nav" } } });
mkdirSync(values.out!, { recursive: true });

if (values.vscode) {
  const dir = values.vscode;
  type Topic = [string, string, ({ name?: string; topics?: Topic[] } & Record<string, unknown>)?];
  const fromToc = (sections: { name: string; topics: Topic[] }[]): NavItem[] =>
    sections.map((s) => ({ title: s.name, children: topics(s.topics) }));
  const topics = (list: Topic[]): NavItem[] =>
    list.map(([title, href, opts]) =>
      opts?.topics ? { title: String(opts.name), children: topics(opts.topics) } : { title, path: href.replace(/^\/+/, "").replace(/\/+$/, "") },
    );
  const docs = fromToc(parseLoose(readFileSync(join(dir, "docs/toc.json"), "utf8")));
  const api = fromToc(parseLoose(readFileSync(join(dir, "api/toc.json"), "utf8")));
  // リリースノートは、新しい順に並べる。原文のサイトと同じく、版の番号を題名にする。
  const versions = readdirSync(join(dir, "release-notes"))
    .map((f) => /^v(\d+)_(\d+)\.md$/.exec(f))
    .filter((m): m is RegExpExecArray => Boolean(m))
    .sort((a, b) => Number(b[1]) - Number(a[1]) || Number(b[2]) - Number(a[2]))
    .slice(0, 30)
    .map((m) => ({ title: `Version ${m[1]}.${m[2]}`, path: `updates/v${m[1]}_${m[2]}` }));
  write("code.visualstudio.com", { docs, api, updates: [{ title: "Updates", children: versions }] });
}

if (values.github) {
  const dir = values.github;
  const variables = new Map<string, unknown>();
  const variable = (path: string): string => {
    const [file, ...keys] = path.split(".");
    if (!variables.has(file!)) {
      const f = join(dir, "data/variables", `${file}.yml`);
      variables.set(file!, existsSync(f) ? parseYaml(readFileSync(f, "utf8")) : {});
    }
    let node = variables.get(file!);
    for (const k of keys) node = node && typeof node === "object" ? (node as Record<string, unknown>)[k] : undefined;
    return typeof node === "string" ? node : "";
  };
  const features = new Map<string, boolean>();
  const featureEnabled = (name: string): boolean => {
    if (name === "fpt") return true;
    if (name === "ghec" || name === "ghes") return false;
    if (!features.has(name)) {
      const f = join(dir, "data/features", `${name}.yml`);
      const v = existsSync(f) ? (parseYaml(readFileSync(f, "utf8")) as { versions?: Record<string, unknown> })?.versions : undefined;
      features.set(name, Boolean(v && "fpt" in v));
    }
    return features.get(name)!;
  };
  // 題名のLiquidを、github.comの版で展開する。
  const title = (raw: string): string =>
    raw
      .replace(/\{%-?\s*ifversion\s+([^%]+?)\s*-?%\}([\s\S]*?)(?:\{%-?\s*else\s*-?%\}([\s\S]*?))?\{%-?\s*endif\s*-?%\}/g, (_, cond: string, a: string, b = "") =>
        cond.split(/\s+or\s+/).some((c) => !/^not\s/.test(c) && featureEnabled(c.trim().split(/\s/)[0]!)) ? a : b,
      )
      .replace(/\{%-?\s*data\s+variables\.([\w.\-]+)\s*-?%\}/g, (_, p: string) => variable(p))
      .trim();
  const readPage = (file: string) => {
    const text = readFileSync(file, "utf8");
    const fm = /^---\n([\s\S]*?)\n---/.exec(text)?.[1] ?? "";
    // フロントマターにはLiquidが入るので、Liquidを文字列として扱えるよう引用し直さずに、YAMLとして読めるものだけ読む。
    let data: Record<string, unknown> = {};
    try {
      data = (parseYaml(fm) ?? {}) as Record<string, unknown>;
    } catch {}
    return data as { title?: string; shortTitle?: string; children?: string[]; versions?: Record<string, unknown>; hidden?: boolean };
  };
  const onFpt = (versions?: Record<string, unknown>) => !versions || "fpt" in versions || (typeof versions.feature === "string" && featureEnabled(versions.feature));
  const walk = (urlPath: string): NavItem | undefined => {
    const base = join(dir, "content", urlPath);
    const file = existsSync(join(base, "index.md")) ? join(base, "index.md") : `${base}.md`;
    if (!existsSync(file)) return undefined;
    const page = readPage(file);
    if (page.hidden || !onFpt(page.versions)) return undefined;
    const item: NavItem = { title: title(page.shortTitle ?? page.title ?? urlPath), path: `en/${urlPath}` };
    const children = (page.children ?? []).map((c) => walk(`${urlPath}/${c.replace(/^\//, "")}`)).filter((c): c is NavItem => Boolean(c));
    if (children.length) item.children = children;
    return item;
  };
  const root = readPage(join(dir, "content/index.md"));
  const sections: Record<string, NavItem[]> = {};
  for (const child of root.children ?? []) {
    const product = child.replace(/^\//, "");
    const tree = walk(product);
    if (tree) sections[product] = [tree];
  }
  write("docs.github.com", sections);
}

function write(host: string, sections: Record<string, NavItem[]>) {
  writeFileSync(join(values.out!, `${host}.json`), JSON.stringify(sections) + "\n");
  console.log(host, Object.keys(sections).length, "sections");
}

// VS Codeの toc.json は、行のコメントや末尾のカンマを含むことがあり、厳密なJSONではない。
function parseLoose(text: string) {
  return JSON.parse(text.replace(/^\s*\/\/.*$/gm, "").replace(/,(\s*[\]}])/g, "$1"));
}
