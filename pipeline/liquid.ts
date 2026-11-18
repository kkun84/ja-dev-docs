// GitHub Docsの原文にあるLiquidのうち、訳す前に決められるものを展開する。
//
// 読者が見るのはgithub.comの版(fpt)なので、{% ifversion %} はその版で評価する。
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

  text = trimWhitespaceControl(text);

  // 再利用部品は、行のどこにあっても展開する。複数行の部品は、埋め込む位置の字下げ、リストの記号の幅、引用の > に合わせる。
  // 部品の中の部品は、部品を展開するときの再帰で展開する。本文全体を展開し直すことはしない(部品の数の累乗で遅くなるため)。
  text = await replaceAsync(text, /\{%-?\s*data\s+reusables\.([\w.\-\/]+)\s*-?%\}/g, async (all, path: string, offset: number, whole: string) => {
    if (depth >= MAX_DEPTH) return all;
    const body = await ctx.reusable(path.replace(/\./g, "/"));
    if (body === undefined) return all;
    const expanded = (await expandLiquid(body, ctx, depth + 1)).replace(/\n+$/, "");
    const before = whole.slice(whole.lastIndexOf("\n", offset - 1) + 1, offset);
    const pad = continuationPad(before);
    return expanded.split("\n").map((line, i) => (i === 0 ? line : line ? pad + line : pad.trimEnd())).join("\n");
  });

  text = await evaluateIfs(text, ctx);
  // アイコンの直後に名前の文字が続く(「{% octicon %} Agents」)ときは、アイコンを除く。
  // 名前が続かない(「Click {% octicon %}, then」)ときは、アイコンが唯一の目的語なので、説明(aria-label)の文字にする。
  // 除くときは、前後の両方に空白があれば1つ残し、片方だけなら残さない(**{% octicon %} Agents** が ** Agents** にならないように)。
  text = text.replace(/([ \t]?)\{%-?\s*octicon\s([^%]*?)-?%\}([ \t]?)(?=(.?))/g, (_, a: string, args: string, b: string, next: string) => {
    const label = /aria-label="([^"]+)"/.exec(args)?.[1];
    if (label && !/[A-Za-z0-9*_`]/.test(next)) return `${a}${label}${b}`;
    return a && b ? " " : "";
  });
  // ツールごとの手順の切り替え({% webui %} など)は、ツール名の見出しにして全部を並べる。
  text = text.replace(/^([ \t]*)\{%-?\s*(\w+)\s*-?%\}[ \t]*$/gm, (all, indent: string, tag: string) => (TOOL_LABELS[tag] ? `${indent}**${TOOL_LABELS[tag]}**` : all));
  text = text.replace(/[ \t]*\{%-?\s*end(\w+)\s*-?%\}/g, (all, tag: string) => (TOOL_LABELS[tag] || DROP_TAGS.has(tag) ? "" : all));
  // 表示に関わらない囲みのタグは除く。
  text = text.replace(/[ \t]*\{%-?\s*(\w+)\s*-?%\}/g, (all, tag: string) => (DROP_TAGS.has(tag) ? "" : all));
  text = await replaceAsync(text, /\[AUTOTITLE\]\(([^)\s#]+)(#[^)\s]*)?\)/g, async (all, path: string, anchor = "") => {
    const title = await ctx.title(path);
    return title ? `[${title}](${path}${anchor})` : all;
  });

  return text.replace(/\u0000RAW(\d+)\u0000/g, (_, i: string) => raws[Number(i)]!);
}

// 複数行の部品の2行目以降の頭に付けるもの。字下げ、引用の >、リストの記号の幅を合わせる。
function continuationPad(before: string): string {
  const m = /^((?:[ \t]*>[ \t]?)*)([ \t]*)((?:[-*+]|\d+[.)])[ \t]+)?/.exec(before)!;
  return m[1]! + m[2]! + " ".repeat(m[3]?.length ?? 0);
}

// {%- と -%} の空白除去。Liquidと同じく、前(後ろ)の改行を含む空白を除く。表の行の間に条件分岐を書く形で使われる。
function trimWhitespaceControl(text: string): string {
  return text.replace(/\s*(\{%-)/g, "$1").replace(/(-%\})\s*/g, "$1");
}

const TOOL_LABELS: Record<string, string> = {
  webui: "Web UI",
  cli: "GitHub CLI",
  desktop: "GitHub Desktop",
  curl: "curl",
  codespaces: "Codespaces",
  vscode: "Visual Studio Code",
  visualstudio: "Visual Studio",
  jetbrains: "JetBrains IDEs",
  xcode: "Xcode",
  eclipse: "Eclipse",
  mac: "Mac",
  windows: "Windows",
  linux: "Linux",
  javascript: "JavaScript",
  bash: "Bash",
  powershell: "PowerShell",
  api: "API",
};

const DROP_TAGS = new Set(["note", "tip", "warning", "danger", "caution", "rowheaders", "comment"]);

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
  // 原文のリポジトリへの問い合わせが一度に集中しないよう、1つずつ処理する。
  let last = 0;
  let out = "";
  const matches = [...text.matchAll(re)];
  const results: string[] = [];
  for (const m of matches) results.push(await fn(...m, m.index, text));
  matches.forEach((m, i) => {
    out += text.slice(last, m.index) + results[i];
    last = m.index! + m[0].length;
  });
  return out + text.slice(last);
}
