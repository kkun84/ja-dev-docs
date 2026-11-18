/**
 * 原文のサイトのURLと、原文のリポジトリのファイルを対応させる純関数。
 *
 * 同じページを別の名前で列に入れられないよう、URLの表記の揺れはここで1つにまとめる。
 */

/** 原文のサイト1つ分の決まり。 */
export interface Source {
  readonly host: string
  readonly repo: string
  readonly branch: string
  /** URLのパスを、このサイトでのページの名前に正規化する。受け付けないURLは`undefined`。 */
  readonly canonical: (path: string) => string | undefined
  /** 正規化したパスから、候補になるリポジトリ内のファイルを返す。先に見つかったものを使う。 */
  readonly candidates: (path: string) => ReadonlyArray<string>
}

/** 原文のページ1つ。 */
export interface PageRef {
  readonly source: Source
  /** 正規化したURLのパス。先頭と末尾の`/`は無い。ページの名前と、訳文の置き場所に使う。 */
  readonly path: string
}

const vscode: Source = {
  host: "code.visualstudio.com",
  repo: "microsoft/vscode-docs",
  branch: "main",
  // リリースノートは、リポジトリのrelease-notes/v1_147とサイトのupdates/v1_147を同じページとして扱う。
  canonical: (path) => path.replace(/^release-notes\//, "updates/").replace(/\.md$/, ""),
  candidates: (path) => {
    const updates = /^updates\/(v\d+_\d+)$/.exec(path)
    return updates === null ? [`${path}.md`, `${path}/index.md`] : [`release-notes/${updates[1]}.md`]
  }
}

const stripLanguage = (path: string): string => path.replace(/^en(?:\/|$)/, "")

const ENTERPRISE = /^enterprise-(?:server|cloud)@/

const github: Source = {
  host: "docs.github.com",
  repo: "github/docs",
  branch: "main",
  // 言語はenに揃える。版はgithub.com(free-pro-team)だけを受け付ける。
  // Enterpriseの版は本文の条件分岐が違うので、今は訳さない。
  canonical: (path) => {
    const withoutLanguage = stripLanguage(path)
    const page = withoutLanguage.replace(/^free-pro-team@latest(?:\/|$)/, "")
    return ENTERPRISE.test(withoutLanguage) ? undefined : ["en", page].filter((part) => part !== "").join("/")
  },
  candidates: (path) => {
    const page = stripLanguage(path)
    return page === "" ? ["content/index.md"] : [`content/${page}.md`, `content/${page}/index.md`]
  }
}

const SOURCES: ReadonlyMap<string, Source> = new Map([vscode, github].map((source) => [source.host, source]))

/** ホスト名から原文のサイトを引く。対象外のホストは`undefined`。 */
export const sourceOf = (host: string): Source | undefined => SOURCES.get(host)

/** このサイトでのページの場所。原文のURLから`https://`を除いたもの。 */
export const pageId = (host: string, path: string): string => (path === "" ? host : `${host}/${path}`)

/** ページの原文のURL。 */
export const pageUrl = (ref: PageRef): string => `https://${ref.source.host}/${ref.path}`

/** 原文のリポジトリのファイルを、そのまま取得できるURL。`revision`はブランチ名かコミット。 */
export const rawUrl = (repo: string, revision: string, file: string): string =>
  `https://raw.githubusercontent.com/${repo}/${revision}/${file}`

// パスに使ってよい文字。.や..だけの区間は認めない(原文のリポジトリの外や、content/の外を指させないため)。
const SAFE_PATH = /^[A-Za-z0-9@_-][A-Za-z0-9@._-]*(?:\/[A-Za-z0-9@_-][A-Za-z0-9@._-]*)*$/
const MAX_PATH_LENGTH = 300

const isSafePath = (path: string): boolean =>
  path.length <= MAX_PATH_LENGTH && (path === "" || SAFE_PATH.test(path)) && !path.split("/").some((segment) => /^\.+$/.test(segment))

const toUrl = (input: string): URL | undefined => {
  const trimmed = input.trim()
  try {
    const decoded = /^https?%3A/i.test(trimmed) ? decodeURIComponent(trimmed) : trimmed
    return new URL(/^https?:\/\//.test(decoded) ? decoded : `https://${decoded}`)
  } catch {
    // 不正な%などで解釈できないURL。
    return undefined
  }
}

const decodePath = (pathname: string): string | undefined => {
  try {
    return decodeURIComponent(pathname).replaceAll(/^\/+|\/+$/g, "")
  } catch {
    return undefined
  }
}

/**
 * 原文のURL(`https://`の有無、URLエンコードを問わない)を解釈し、ページの名前に正規化する。
 * 対象外のサイト、使えない文字を含むパス、受け付けない版は`undefined`。
 */
export const parsePageUrl = (input: string): PageRef | undefined => {
  const url = toUrl(input)
  const source = url === undefined ? undefined : sourceOf(url.hostname)
  const raw = url === undefined ? undefined : decodePath(url.pathname)
  if (source === undefined || raw === undefined || !isSafePath(raw)) {
    return undefined
  }
  const path = source.canonical(raw)
  return path === undefined ? undefined : { source, path }
}

/**
 * このサイトのURLのパスから、原文のページを解釈する。
 *
 * `/https:/code.visualstudio.com/...`のように、ブラウザやCDNが`//`を1つにまとめた形も受け付ける。
 */
export const parseSitePath = (pathname: string): PageRef | undefined =>
  parsePageUrl(pathname.slice(1).replace(/^(https?):\/(?!\/)/, "$1://"))
