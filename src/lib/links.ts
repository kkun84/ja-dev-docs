// 訳文の中のリンクを書き換える。
//
// 描画したHTMLのa、img、video、sourceの属性だけを書き換える。Markdownの文字列に正規表現をかけると、
// コードブロックの中のhandlers[name](event) のような文字までリンクとして書き換えてしまうため。
// リンク先に訳があれば、このサイトの訳のページへ。無ければ原文のサイトへ。画像は原文のサイトから読む。

import { posix } from "node:path";

export interface PageRecord {
  url: string;
  repo: string;
  file: string;
  commit?: string;
}

// このサイトでのページの場所。原文のURLから https:// を除いたもの。
export const pageId = (host: string, path: string) => (path ? `${host}/${path}` : host);

const TAG_RE = /<(a|img|video|source|audio)\b[^>]*>/gi;
const ATTR_RE = /\b(href|src|poster)=("([^"]*)"|'([^']*)')/gi;

export function rewriteHtmlLinks(html: string, record: PageRecord, translated: Set<string>): string {
  return html.replace(TAG_RE, (tag, name: string) =>
    tag.replace(ATTR_RE, (_all, attr: string, _q, dq?: string, sq?: string) => {
      const value = decodeEntities(dq ?? sq ?? "");
      const media = name.toLowerCase() !== "a";
      return `${attr}="${encodeEntities(resolveHref(value, record, translated, media))}"`;
    }),
  );
}

export function resolveHref(href: string, record: PageRecord, translated: Set<string>, media = false): string {
  if (!href || href.startsWith("#")) return href;
  // http(s) 以外のスキーム(mailto:、vscode:、command: など)はそのまま。
  if (/^[a-z][a-z0-9+.-]*:/i.test(href) && !/^https?:/i.test(href)) return href;
  if (href.startsWith("//")) href = "https:" + href;
  const [pathPart, hash = ""] = splitHash(href);
  const source = new URL(record.url);

  if (/^https?:\/\//i.test(pathPart)) {
    const u = new URL(pathPart);
    const id = pageId(u.hostname, u.pathname.replace(/^\/+|\/+$/g, ""));
    return translated.has(id) ? `/${id}${hash}` : href;
  }

  if (source.hostname === "code.visualstudio.com") {
    // VS Codeの原文は、リポジトリ内のファイルを相対パスか / 始まりで指す。
    const repoPath = pathPart.startsWith("/") ? posix.normalize(pathPart.slice(1)) : posix.normalize(posix.join(posix.dirname(record.file), pathPart));
    if (media || (!/\.md$/.test(repoPath) && /\.\w{2,5}$/.test(repoPath))) return vscodeAsset(repoPath);
    const urlPath = repoPath.replace(/\.md$/, "").replace(/\/index$/, "").replace(/^release-notes\//, "updates/");
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

// VS Codeの画像と動画は、原文のリポジトリではGit LFSに入っていて、raw.githubusercontent.comからは取れない。
// 原文のサイトが配信している場所に対応させる。docs/agents/images/x/y.pngは /assets/docs/agents/x/y.png、
// release-notes/images/1_147/y.pngは /assets/updates/1_147/y.pngになる。
function vscodeAsset(repoPath: string): string {
  const m = /^(.*?)\/images\/(.+)$/.exec(repoPath);
  if (!m) return `https://code.visualstudio.com/${repoPath}`;
  const dir = m[1]!.replace(/^release-notes$/, "updates");
  return `https://code.visualstudio.com/assets/${dir}/${m[2]}`;
}

function splitHash(href: string): [string, string?] {
  const i = href.indexOf("#");
  return i < 0 ? [href] : [href.slice(0, i), href.slice(i)];
}

function decodeEntities(s: string): string {
  return s.replace(/&#x([0-9a-f]+);/gi, (_, h: string) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (_, d: string) => String.fromCodePoint(Number(d))).replace(/&quot;/g, '"').replace(/&amp;/g, "&");
}

function encodeEntities(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}
