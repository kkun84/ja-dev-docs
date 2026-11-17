// Markdownの骨組みはプログラムが持ち、文の部分だけを断片として取り出す。
//
// 原文の文字列はそのまま残し、段落・見出し・表のセル・HTMLブロックの行の範囲だけを訳文に差し替える。
// 見出しやリストの記号、字下げ、コードブロックはモデルに渡らないので、構造は壊れない。

import type { Root, RootContent, Nodes } from "mdast";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { toString } from "mdast-util-to-string";
import { Masker } from "./mask.ts";

export type SegmentKind = "paragraph" | "heading" | "cell" | "html" | "front";

export interface Segment {
  id: number;
  // モデルに渡す文。行内コードやリンク先は目印になっている。
  text: string;
}

interface Range {
  start: number;
  end: number;
  // 範囲の前に固定で残す部分(GitHubのアラートの [!NOTE] など)。
  head: string;
  segment: Segment;
  kind: SegmentKind;
  // 訳さなかったときに戻す、範囲の元の文字列。
  original: string;
}

export interface Prepared {
  masked: string;
  ranges: Range[];
  segments: Segment[];
  kinds: Map<number, SegmentKind>;
  headings: string[];
}

export type VariableResolver = (path: string) => string | undefined;

export interface Keybinding {
  win: string;
  mac: string;
}

export interface PrepareOptions {
  variables: VariableResolver;
  // VS Codeの kb(コマンド) を、既定のキー割り当てにする。
  keybinding?: (command: string) => Keybinding | undefined;
}

const HTML_TAG_RE = /<\/?[A-Za-z][^>]*>/g;
// Liquidのタグは1行の中だけで探す。行をまたいで探すと、別々の段落の {{ と }} が組になり、間の本文を飲み込む。
const LIQUID_RE = /\{%-?[^\n]*?-?%\}|\{\{[^\n]*?\}\}/g;
const VARIABLE_RE = /^\{%-?\s*data\s+variables\.([\w.\-]+)\s*-?%\}$/;
const ALERT_RE = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]$/;
const CONTINUATION_PREFIX_RE = /^[ \t]*(?:>[ \t]?)*[ \t]*/;
const HARD_BREAK_RE = /( {2,}|\\)$/;
const RAW_HTML_START_RE = /<(pre|script|style|code|textarea)\b/i;
const RAW_HTML_END_RE = /<\/(pre|script|style|code|textarea)>/i;

const parser = unified().use(remarkParse).use(remarkGfm);

export function parseMarkdown(text: string): Root {
  return parser.parse(text) as Root;
}

// 本文(フロントマターを除いたもの)に、ブロック全体に効く目印を置く。HTMLコメント、Liquidタグ、kb()。
export function maskBlocks(body: string, masker: Masker, opts: PrepareOptions): string {
  // mutator-disable-next-line Regex: oxcがTypeScriptで、カッコの直後の<!--で始まる正規表現を解析できない。
  body = body.replace(/<!--[\s\S]*?-->/g, (m) => masker.put("comment", m));
  body = body.replace(LIQUID_RE, (tag) => {
    const v = VARIABLE_RE.exec(tag);
    const value = v ? opts.variables(v[1]!) : undefined;
    return value !== undefined ? masker.put("variable", tag, value) : masker.put("liquid", tag);
  });
  if (opts.keybinding) {
    body = body.replace(/\bkb\(([\w.\-]+)\)/g, (all, command: string) => {
      const k = opts.keybinding!(command);
      return masker.put("kbd", all, k ? `keyboard shortcut ${k.win}` : `keyboard shortcut for the command ${command}`);
    });
  }
  return body;
}

// 断片の中で、モデルに書き換えさせたくない行内の部分を目印にする。
export function maskInline(text: string, masker: Masker): string {
  text = text.replace(/(`+)(?!`)([\s\S]+?)(?<!`)\1(?!`)/g, (m) => masker.put("code", m));
  text = text.replace(/(\]\()(<[^>]*>|[^)\s]+)((?:\s+"[^"]*")?\))/g, (_, a: string, url: string, b: string) => a + masker.put("url", url) + b);
  text = text.replace(/<(?:https?|mailto):[^>\s]+>/g, (m) => masker.put("url", m));
  text = text.replace(/(?<![\w(⟦/"'=])https?:\/\/[^\s<>()\]`]+[^\s<>()\]`.,;:!?'"]/g, (m) => masker.put("bareurl", m));
  return text;
}

export function hasText(text: string): boolean {
  return /[A-Za-z]/.test(text.replace(/⟦[^⟧]*⟧/g, "").replace(HTML_TAG_RE, ""));
}

export function prepare(body: string, masker: Masker, opts: PrepareOptions): Prepared {
  const masked = maskBlocks(body, masker, opts);
  const tree = parseMarkdown(masked);
  const ranges: Range[] = [];
  const segments: Segment[] = [];
  const kinds = new Map<number, SegmentKind>();
  const headings: string[] = [];

  const add = (start: number, end: number, kind: SegmentKind) => {
    const original = masked.slice(start, end);
    const raw = original.split("\n");
    let head = "";
    let first = 0;
    if (raw.length > 1 && ALERT_RE.test(raw[0]!.trim())) {
      // [!NOTE] の行はそのまま残し、次の行の字下げや > もそのまま残す。
      const prefix = CONTINUATION_PREFIX_RE.exec(raw[1]!)![0];
      head = raw[0] + "\n" + prefix;
      start += raw[0]!.length + 1 + prefix.length;
      first = 1;
    }
    // 行をつなぐ。硬い改行(行末の空白2つか \)は、改行と次の行の字下げごと目印にして保つ。
    let text = "";
    for (let i = first; i < raw.length; i++) {
      const prefix = i === 0 ? "" : CONTINUATION_PREFIX_RE.exec(raw[i]!)![0];
      let line = raw[i]!.slice(prefix.length);
      if (i > first) {
        const prev = HARD_BREAK_RE.exec(text);
        if (prev) {
          text = text.slice(0, -prev[1]!.length) + masker.put("break", prev[1] + "\n" + prefix, "line break");
        } else text += " ";
      }
      if (i < raw.length - 1) line = line.replace(/[ \t]+$/, (s) => (s.length >= 2 ? s : ""));
      text += i === raw.length - 1 ? line.trimEnd() : line;
    }
    text = text.trim();
    if (!hasText(text)) return;
    const segment = { id: segments.length + 1, text: maskInline(text, masker) };
    segments.push(segment);
    kinds.set(segment.id, kind);
    ranges.push({ start, end, head, segment, kind, original: masked.slice(start, end) });
  };

  const walk = (node: Nodes, parentIsBlockContainer: boolean) => {
    const p = node.position;
    switch (node.type) {
      case "heading": {
        headings.push(masker.unmask(toString(node), (m) => (m.kind === "variable" ? m.meaning : m.original)));
        if (!p) return;
        let start = p.start.offset!;
        let end = p.end.offset!;
        const src = masked.slice(start, end);
        const atx = /^#{1,6}[ \t]+/.exec(src);
        if (atx) {
          // # の後ろから、閉じの # の手前までを差し替える。
          start += atx[0].length;
          end -= /[ \t]+#+[ \t]*$/.exec(src)?.[0].length ?? 0;
        } else {
          // Setext見出しは、下線の行を残す。
          const lines = src.split("\n");
          end = start + lines.slice(0, -1).join("\n").length;
        }
        add(start, end, "heading");
        return;
      }
      case "paragraph":
        if (p) add(p.start.offset!, p.end.offset!, "paragraph");
        return;
      case "tableCell": {
        // セルの範囲には前後の | と空白が含まれるので除く。
        if (!p) return;
        const raw = masked.slice(p.start.offset!, p.end.offset!);
        const lead = /^\|?[ \t]*/.exec(raw)![0].length;
        const trail = /[ \t]*\|?[ \t]*$/.exec(raw.slice(lead))![0].length;
        if (raw.length - lead - trail > 0) add(p.start.offset! + lead, p.end.offset! - trail, "cell");
        return;
      }
      case "html": {
        // HTMLブロックは行ごとに訳す。行をつなぐとHTMLブロックの終わりが変わるため。
        // <pre> や <script> の中はコードなので訳さない。引用の中の行は、行頭の > を除いて渡す。
        if (!parentIsBlockContainer || !p) return;
        let offset = p.start.offset!;
        let inRaw = false;
        masked
          .slice(p.start.offset!, p.end.offset!)
          .split("\n")
          .forEach((line, i) => {
            const prefix = i === 0 ? /^[ \t]*/.exec(line)![0] : CONTINUATION_PREFIX_RE.exec(line)![0];
            const content = line.slice(prefix.length);
            const opens = RAW_HTML_START_RE.test(content);
            const closes = RAW_HTML_END_RE.test(content);
            if (!inRaw && !opens && content.trim()) add(offset + prefix.length, offset + line.trimEnd().length, "html");
            if (opens && !closes) inRaw = true;
            else if (closes) inRaw = false;
            offset += line.length + 1;
          });
        return;
      }
      case "code":
      case "definition":
      case "thematicBreak":
      case "yaml":
        return;
    }
    if ("children" in node) {
      for (const child of node.children as RootContent[]) walk(child, node.type === "root" || node.type === "listItem" || node.type === "blockquote");
    }
  };
  walk(tree, true);
  return { masked, ranges, segments, kinds, headings };
}

// 訳文を差し込んで本文を組み立てる。訳が無い断片は原文のまま戻す。
export function assemble(prep: Prepared, translations: Map<number, string>): string {
  let out = "";
  let pos = 0;
  for (const r of [...prep.ranges].sort((a, b) => a.start - b.start)) {
    const t = translations.get(r.segment.id);
    out += prep.masked.slice(pos, r.start - r.head.length) + r.head;
    out += t === undefined ? r.original : t;
    pos = r.end;
  }
  return out + prep.masked.slice(pos);
}
