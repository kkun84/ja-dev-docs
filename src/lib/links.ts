// 訳文の中のリンクを書き換える。
//
// リンク先に訳があれば、このサイトの訳のページへ。無ければ原文のサイトへ。
// 画像は原文のリポジトリから読む。

import { posix } from "node:path";

export interface PageRecord {
  url: string;
  repo: string;
  file: string;
  commit?: string;
}

// このサイトでのページの場所。原文のURLから https:// を除いたもの。
export const pageId = (host: string, path: string) => (path ? `${host}/${path}` : host);

export function rewriteLinks(markdown: string, record: PageRecord, translated: Set<string>): string {
  const rewrite = (href: string, image: boolean) => resolveHref(href, record, translated, image);
  return markdown
    .replace(/(!?)\[((?:[^\[\]]|\[[^\]]*\])*)\]\((<[^>]*>|[^)\s]+)((?:\s+"[^"]*")?)\)/g, (all, bang: string, text: string, href: string, title: string) => {
      const target = href.replace(/^<|>$/g, "");
      return `${bang}[${text}](${rewrite(target, bang === "!")}${title})`;
    })
    .replace(/\b(href|src)="([^"]+)"/g, (_, attr: string, href: string) => `${attr}="${rewrite(href, attr === "src")}"`);
}

export function resolveHref(href: string, record: PageRecord, translated: Set<string>, image = false): string {
  if (/^(#|mailto:|data:)/.test(href)) return href;
  const [pathPart, hash = ""] = splitHash(href);
  const source = new URL(record.url);

  if (/^https?:\/\//.test(pathPart)) {
    const u = new URL(pathPart);
    const id = pageId(u.hostname, u.pathname.replace(/^\/+|\/+$/g, ""));
    return translated.has(id) ? `/${id}${hash}` : href;
  }

  if (source.hostname === "code.visualstudio.com") {
    // VS Codeの原文は、リポジトリ内のMarkdownファイルを相対パスか / 始まりで指す。
    const repoPath = pathPart.startsWith("/") ? pathPart.slice(1) : posix.normalize(posix.join(posix.dirname(record.file), pathPart));
    if (image || !/\.md$/.test(repoPath) && /\.\w{2,5}$/.test(repoPath)) {
      return `https://raw.githubusercontent.com/${record.repo}/${record.commit ?? "main"}/${repoPath}`;
    }
    let urlPath = repoPath.replace(/\.md$/, "").replace(/\/index$/, "").replace(/^release-notes\//, "updates/");
    const id = pageId(source.hostname, urlPath);
    return translated.has(id) ? `/${id}${hash}` : `https://code.visualstudio.com/${urlPath}${hash}`;
  }

  if (source.hostname === "docs.github.com") {
    if (pathPart.startsWith("/assets/")) return `https://docs.github.com${pathPart}`;
    if (pathPart.startsWith("/")) {
      const urlPath = ("en" + pathPart).replace(/\/+$/, "");
      const id = pageId(source.hostname, urlPath);
      return translated.has(id) ? `/${id}${hash}` : `https://docs.github.com/${urlPath}${hash}`;
    }
  }
  return href;
}

function splitHash(href: string): [string, string?] {
  const i = href.indexOf("#");
  return i < 0 ? [href] : [href.slice(0, i), href.slice(i)];
}
