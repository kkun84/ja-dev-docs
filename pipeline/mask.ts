// 訳してはいけない部分を、意味のないランダムなIDの目印に置き換える。
//
// 目印は ⟦K7QM⟧ の形。IDは取り違えやすい文字(I、L、O、U、0、1)を除いた30文字から4文字を選ぶ。
// 連番やヒントを入れると、モデルが隣の番号やヒントの中身を推測して書き換えるため。
// どの2つのIDも2文字以上違うように作り、1文字の書き間違いは元の目印に直せるようにする。

const ID_ALPHABET = "ABCDEFGHJKMNPQRSTVWXYZ23456789";
export const TOKEN_RE = /⟦([^⟧\s]{1,12})⟧/g;

export type TokenKind = "liquid" | "variable" | "comment" | "code" | "url" | "bareurl" | "kbd" | "break";

export interface Masked {
  kind: TokenKind;
  original: string;
  // モデルに渡す対応表の値。変数は値(製品名など)、それ以外は原文の記法のまま。
  meaning: string;
}

export class Masker {
  readonly store = new Map<string, Masked>();
  private readonly random: () => number;

  constructor(seed: string) {
    this.random = mulberry32(hash(seed));
  }

  put(kind: TokenKind, original: string, meaning = original): string {
    const id = this.newId();
    this.store.set(id, { kind, original, meaning });
    return `⟦${id}⟧`;
  }

  // 目印を戻す。中身に別の目印が入っていることがあるので、無くなるまで繰り返す。
  unmask(text: string, render: (m: Masked) => string = (m) => m.original): string {
    for (let i = 0; i < 5 && text.includes("⟦"); i++) {
      text = text.replace(TOKEN_RE, (all, id: string) => {
        const m = this.store.get(id);
        return m ? render(m) : all;
      });
    }
    return text;
  }

  // 存在しない目印のうち、1文字違いの目印が1つだけあるものを、その目印に直す。
  repair(text: string): string {
    return text.replace(TOKEN_RE, (all, id: string) => {
      if (this.store.has(id)) return all;
      const near = [...this.store.keys()].filter((k) => distance(k, id) <= 1);
      return near.length === 1 ? `⟦${near[0]}⟧` : all;
    });
  }

  private newId(): string {
    for (;;) {
      let id = "";
      for (let i = 0; i < 4; i++) id += ID_ALPHABET[Math.floor(this.random() * ID_ALPHABET.length)];
      if ([...this.store.keys()].every((k) => distance(k, id) >= 2)) return id;
    }
  }
}

export function tokensIn(text: string): string[] {
  return [...text.matchAll(TOKEN_RE)].map((m) => m[1]!).sort();
}

function distance(a: string, b: string): number {
  if (a.length !== b.length) return 99;
  let d = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d++;
  return d;
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

function mulberry32(a: number): () => number {
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
