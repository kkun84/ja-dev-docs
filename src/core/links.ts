/**
 * 訳文の中のリンクを書き換える。
 *
 * 描画したHTMLのa、img、video、sourceの属性だけを書き換える。Markdownの文字列に正規表現をかけると、
 * コードブロックの中の`handlers[name](event)`のような文字までリンクとして書き換えてしまうため。
 * リンク先に訳があれば、このサイトの訳のページへ。無ければ原文のサイトへ。画像は原文のサイトから読む。
 */
import { pageId } from "./source.ts"
import { capture } from "./text.ts"

/** リンクを書き換えるページの、原文での場所。 */
export interface LinkOrigin {
  /** 原文のURL。 */
  readonly url: string
  /** 原文のリポジトリの中のファイル。相対リンクを解決する起点になる。 */
  readonly file: string
}

const TAG = /<(a|img|video|source|audio)\b[^>]*>/gi
const ATTRIBUTE = /\b(href|src|poster)=(?:"([^"]*)"|'([^']*)')/gi

const decodeEntities = (text: string): string =>
  text
    .replaceAll(/&#x([0-9a-f]+);/gi, (_all, hex: string) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replaceAll(/&#(\d+);/g, (_all, decimal: string) => String.fromCodePoint(Number(decimal)))
    .replaceAll("&quot;", '"')
    .replaceAll("&amp;", "&")

const encodeEntities = (text: string): string => text.replaceAll("&", "&amp;").replaceAll('"', "&quot;")

// パスの.と..を解決する。先頭より上へは出ない。
const normalizePath = (path: string): string => {
  const resolved: string[] = []
  for (const segment of path.split("/")) {
    if (segment === "..") {
      resolved.pop()
    } else if (segment !== "" && segment !== ".") {
      resolved.push(segment)
    }
  }
  return resolved.join("/")
}

const directoryOf = (file: string): string => file.split("/").slice(0, -1).join("/")

const splitHash = (href: string): readonly [path: string, hash: string] => {
  const index = href.indexOf("#")
  return index === -1 ? [href, ""] : [href.slice(0, index), href.slice(index)]
}

// VS Codeの画像と動画は、原文のリポジトリではGit LFSに入っていて、raw.githubusercontent.comからは取れない。
// 原文のサイトが配信している場所に対応させる。docs/agents/images/x/y.pngは/assets/docs/agents/x/y.png、
// release-notes/images/1_147/y.pngは/assets/updates/1_147/y.pngになる。
const vscodeAsset = (repoPath: string): string => {
  const match = /^(.*?)\/images\/(.+)$/.exec(repoPath)
  if (match === null) {
    return `https://code.visualstudio.com/${repoPath}`
  }
  return `https://code.visualstudio.com/assets/${capture(match, 1).replace(/^release-notes$/, "updates")}/${match[2]}`
}

interface Target {
  readonly origin: LinkOrigin
  /** 訳があるページの場所。 */
  readonly translated: ReadonlySet<string>
  /** 画像や動画などの、ページではないもの。 */
  readonly media: boolean
}

const toPage = (host: string, urlPath: string, hash: string, translated: ReadonlySet<string>): string => {
  const id = pageId(host, urlPath)
  return translated.has(id) ? `/${id}${hash}` : `https://${host}/${urlPath}${hash}`
}

// VS Codeの原文は、リポジトリ内のファイルを相対パスか/始まりで指す。
const resolveVscode = (path: string, hash: string, target: Target): string => {
  const repoPath = normalizePath(path.startsWith("/") ? path : `${directoryOf(target.origin.file)}/${path}`)
  const isAsset = !repoPath.endsWith(".md") && /\.\w{2,5}$/.test(repoPath)
  if (target.media || isAsset) {
    return vscodeAsset(repoPath)
  }
  const urlPath = repoPath
    .replace(/\.md$/, "")
    .replace(/\/index$/, "")
    .replace(/^release-notes\//, "updates/")
  return toPage("code.visualstudio.com", urlPath, hash, target.translated)
}

// GitHub Docsの原文は、サイトのパス(言語なし)を/始まりで指す。
const resolveGithub = (href: string, path: string, hash: string, target: Target): string => {
  if (path.startsWith("/assets/")) {
    return `https://docs.github.com${path}`
  }
  return path.startsWith("/") ? toPage("docs.github.com", `en${path}`.replace(/\/+$/, ""), hash, target.translated) : href
}

const resolveAbsolute = (href: string, path: string, hash: string, translated: ReadonlySet<string>): string => {
  const url = URL.parse(path)
  const id = url === null ? "" : pageId(url.hostname, url.pathname.replaceAll(/^\/+|\/+$/g, ""))
  return translated.has(id) ? `/${id}${hash}` : href
}

const isOtherScheme = (href: string): boolean => /^[a-z][a-z0-9+.-]*:/i.test(href) && !/^https?:/i.test(href)

/** リンク先1つを書き換える。 */
export const resolveHref = (rawHref: string, target: Target): string => {
  // ページ内のリンクと、http(s)以外のスキーム(mailto:、vscode:、command:など)はそのまま。
  if (rawHref === "" || rawHref.startsWith("#") || isOtherScheme(rawHref)) {
    return rawHref
  }
  const href = rawHref.startsWith("//") ? `https:${rawHref}` : rawHref
  const [path, hash] = splitHash(href)
  if (/^https?:\/\//i.test(path)) {
    return resolveAbsolute(href, path, hash, target.translated)
  }
  const host = URL.parse(target.origin.url)?.hostname
  if (host === "code.visualstudio.com") {
    return resolveVscode(path, hash, target)
  }
  return host === "docs.github.com" ? resolveGithub(href, path, hash, target) : href
}

/** 描画したHTMLの、リンクと画像と動画の参照先を書き換える。 */
export const rewriteHtmlLinks = (html: string, origin: LinkOrigin, translated: ReadonlySet<string>): string =>
  html.replaceAll(TAG, (tag, name: string) =>
    tag.replaceAll(ATTRIBUTE, (_all, attribute: string, doubleQuoted: string | undefined, singleQuoted: string | undefined) => {
      const value = decodeEntities(doubleQuoted ?? singleQuoted ?? "")
      const resolved = resolveHref(value, { origin, translated, media: name.toLowerCase() !== "a" })
      return `${attribute}="${encodeEntities(resolved)}"`
    })
  )
