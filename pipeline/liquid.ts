// GitHub Docsの原文にあるLiquidのうち、訳す前に決められるものを展開する。
//
// 読者が見るのは github.com の版(fpt)なので、{% ifversion %} はその版で評価する。
// {% data reusables.… %} は本文に埋め込み、ページ全体を同じ文脈で訳せるようにする。
// [AUTOTITLE](/path) は、リンク先の題名に置き換える。題名も一緒に訳される。
// {% octicon %} はアイコンなので除く。{% data variables.… %} は残し、訳すときに目印にする。

export interface LiquidContext {
  // 版の名前(fpt、ghec、ghes)か、data/features/ の機能の名前が、読者の版で有効か。
  isEnabled(name: string): Promise<boolean>;
  reusable(path: string): Promise<string | undefined>;
  title(path: string): Promise<string | undefined>;
}

const MAX_DEPTH = 5;

export async function expandLiquid(text: string, ctx: LiquidContext, depth = 0): Promise<string> {
  // {% raw %} の中は展開しない。
  const raws: string[] = [];
  text = text.replace(/\{%-?\s*raw\s*-?%\}([\s\S]*?)\{%-?\s*endraw\s*-?%\}/g, (_, inner: string) => {
    raws.push(inner);
    return `\u0000RAW${raws.length - 1}\u0000`;
  });

  text = await replaceAsync(text, /^([ \t]*)(.*?)\{%-?\s*data\s+reusables\.([\w.\-\/]+)\s*-?%\}/gm, async (all, indent: string, before: string, path: string) => {
    if (depth >= MAX_DEPTH) return all;
    const body = await ctx.reusable(path.replace(/\./g, "/"));
    if (body === undefined) return all;
    const expanded = (await expandLiquid(body, ctx, depth + 1)).replace(/\n+$/, "");
    // 複数行の再利用部品は、埋め込む位置の字下げに合わせる。
    const pad = indent + " ".repeat(listMarkerWidth(before));
    return indent + before + expanded.replace(/\n(?=.)/g, "\n" + pad);
  });

  text = await evaluateIfs(text, ctx);
  // アイコンを除く。前後の両方に空白があれば1つ残し、片方だけなら残さない(**{% octicon %} Agents** が ** Agents** にならないように)。
  text = text.replace(/([ \t]?)\{%-?\s*octicon\s[^%]*-?%\}([ \t]?)/g, (_, a: string, b: string) => (a && b ? " " : ""));
  text = await replaceAsync(text, /\[AUTOTITLE\]\(([^)\s#]+)(#[^)\s]*)?\)/g, async (all, path: string, anchor = "") => {
    const title = await ctx.title(path);
    return title ? `[${title}](${path}${anchor})` : all;
  });

  return text.replace(/\u0000RAW(\d+)\u0000/g, (_, i: string) => raws[Number(i)]!);
}

function listMarkerWidth(before: string): number {
  const m = /^(?:[-*+]|\d+[.)])[ \t]+/.exec(before);
  return m ? m[0].length : 0;
}

const IF_TAG_RE = /\{%-?\s*(ifversion|elsif|else|endif)\b([^%]*?)-?%\}/g;

async function evaluateIfs(text: string, ctx: LiquidContext): Promise<string> {
  // 内側の ifversion から順に評価する。
  for (let guard = 0; guard < 1000; guard++) {
    const tags = [...text.matchAll(IF_TAG_RE)];
    let start = -1;
    for (let i = 0; i < tags.length; i++) {
      const kind = tags[i]![1];
      if (kind === "ifversion") start = i;
      else if (kind === "endif" && start >= 0) {
        const block = tags.slice(start, i + 1);
        const branches: { cond: string | null; from: number; to: number }[] = [];
        for (let j = 0; j < block.length - 1; j++) {
          const tag = block[j]!;
          branches.push({ cond: tag[1] === "else" ? null : tag[2]!.trim(), from: tag.index! + tag[0].length, to: block[j + 1]!.index! });
        }
        let chosen = "";
        for (const b of branches) {
          if (b.cond === null || (await evaluate(b.cond, ctx))) {
            chosen = text.slice(b.from, b.to);
            break;
          }
        }
        const end = block.at(-1)!;
        text = text.slice(0, block[0]!.index!) + chosen + text.slice(end.index! + end[0].length);
        break;
      }
      if (i === tags.length - 1) return text;
    }
    if (!tags.length) return text;
  }
  return text;
}

async function evaluate(cond: string, ctx: LiquidContext): Promise<boolean> {
  for (const or of cond.split(/\s+or\s+/)) {
    let all = true;
    for (const and of or.split(/\s+and\s+/)) {
      const m = /^(not\s+)?([\w.\-]+)(?:\s*(<=|>=|<|>|=|!=)\s*[\d.]+)?$/.exec(and.trim());
      if (!m) {
        all = false;
        break;
      }
      // 比較つきの条件(ghes > 3.10 など)は ghes のときだけ意味を持つ。fpt では ghes が無効なので、名前だけで判定する。
      const value = await ctx.isEnabled(m[2]!);
      if (m[1] ? value : !value) {
        all = false;
        break;
      }
    }
    if (all) return true;
  }
  return false;
}

async function replaceAsync(text: string, re: RegExp, fn: (...args: any[]) => Promise<string>): Promise<string> {
  const parts: Promise<string>[] = [];
  let last = 0;
  let out = "";
  const matches = [...text.matchAll(re)];
  for (const m of matches) parts.push(fn(...m));
  const results = await Promise.all(parts);
  matches.forEach((m, i) => {
    out += text.slice(last, m.index) + results[i];
    last = m.index! + m[0].length;
  });
  return out + text.slice(last);
}
