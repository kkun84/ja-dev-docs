/**
 * 訳してはいけない部分を、意味のないランダムなIDの目印に置き換える。
 *
 * 目印は`⟦K7QM⟧`の形。IDは取り違えやすい文字(I、L、O、U、0、1)を除いた30文字から4文字を選ぶ。
 * 連番やヒントを入れると、モデルが隣の番号やヒントの中身を推測して書き換えるため。
 * どの2つのIDも2文字以上違うように作り、1文字の書き間違いは元の目印に直せるようにする。
 */
import { capture } from "./text.ts"

const ID_ALPHABET = "ABCDEFGHJKMNPQRSTVWXYZ23456789"
const ID_LENGTH = 4
// 目印の中に目印が入ることがある(変数の値にコードが入る、など)。戻すのは、この回数まで繰り返す。
const MAX_UNMASK_PASSES = 5

const TOKEN_SOURCE = "⟦([^⟧\\s]{1,12})⟧"

/** 目印を探す正規表現を作る。`g`付きの正規表現は状態を持つので、使うたびに作る。 */
export const tokenPattern = (): RegExp => new RegExp(TOKEN_SOURCE, "g")

export type TokenKind = "liquid" | "variable" | "comment" | "code" | "url" | "bareurl" | "kbd" | "break"

/** 目印1つが表すもの。 */
export interface Masked {
  readonly kind: TokenKind
  readonly original: string
  /** モデルに渡す対応表の値。変数は値(製品名など)、それ以外は原文の記法のまま。 */
  readonly meaning: string
}

/** 文字列に出てくる目印のIDを、出てきた順に返す。 */
export const tokenIds = (text: string): ReadonlyArray<string> => [...text.matchAll(tokenPattern())].map((match) => capture(match, 1))

/** 目印のIDを並べ替えて返す。原文と訳文で、同じ目印が同じ数だけあるかを比べるのに使う。 */
export const sortedTokenIds = (text: string): ReadonlyArray<string> => tokenIds(text).toSorted()

const distance = (left: string, right: string): number => {
  if (left.length !== right.length) {
    return Number.POSITIVE_INFINITY
  }
  let different = 0
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) {
      different += 1
    }
  }
  return different
}

// FNV-1aのハッシュ。種の文字列から、乱数の初期値を作る。
const hash = (seed: string): number => {
  let value = 2_166_136_261
  for (let index = 0; index < seed.length; index += 1) {
    value = Math.imul(value ^ (seed.codePointAt(index) ?? 0), 16_777_619)
  }
  return value >>> 0
}

// mulberry32。種が同じなら同じ列を返すので、同じ原文と種からは同じ目印ができる。
const mulberry32 = (seed: number): (() => number) => {
  let state = seed
  return () => {
    // Math.imulは結果を32ビットの整数に丸める。
    state = Math.imul(state + 0x6d_2b_79_f5, 1)
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state)
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4_294_967_296
  }
}

/** 1ページ分の目印を作り、覚えておき、戻す。 */
export class Masker {
  private readonly store = new Map<string, Masked>()
  private readonly random: () => number

  constructor(seed: string) {
    this.random = mulberry32(hash(seed))
  }

  /** 文字列を目印に置き換え、その目印を返す。 */
  put(kind: TokenKind, original: string, meaning: string = original): string {
    const id = this.newId()
    this.store.set(id, { kind, original, meaning })
    return `⟦${id}⟧`
  }

  /** IDから、目印が表すものを引く。 */
  get(id: string): Masked | undefined {
    return this.store.get(id)
  }

  /** 目印を戻す。中身に別の目印が入っていることがあるので、無くなるまで繰り返す。 */
  unmask(text: string, render: (masked: Masked) => string = (masked) => masked.original): string {
    let current = text
    for (let pass = 0; pass < MAX_UNMASK_PASSES && current.includes("⟦"); pass += 1) {
      current = current.replace(tokenPattern(), (all, id: string) => {
        const masked = this.store.get(id)
        return masked === undefined ? all : render(masked)
      })
    }
    return current
  }

  /** 存在しない目印のうち、1文字違いの目印が1つだけあるものを、その目印に直す。 */
  repair(text: string): string {
    return text.replace(tokenPattern(), (all, id: string) => {
      if (this.store.has(id)) {
        return all
      }
      const near = [...this.store.keys()].filter((known) => distance(known, id) <= 1)
      return near.length === 1 ? `⟦${near[0]}⟧` : all
    })
  }

  private newId(): string {
    for (;;) {
      const id = Array.from({ length: ID_LENGTH }, () => ID_ALPHABET[Math.floor(this.random() * ID_ALPHABET.length)]).join("")
      if ([...this.store.keys()].every((known) => distance(known, id) >= 2)) {
        return id
      }
    }
  }
}
