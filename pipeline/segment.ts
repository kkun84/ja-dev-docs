// Markdownの骨組みはプログラムが持ち、文の部分だけを断片として取り出す。
//
// 原文の文字列はそのまま残し、段落・見出し・表のセル・HTMLブロックの範囲だけを訳文に差し替える。
// 見出しやリストの記号、字下げ、コードブロックはモデルに渡らないので、構造は壊れない。

import type { Root, RootContent, Nodes } from "mdast";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { toString } from "mdast-util-to-string";
import { Masker } from "./mask.ts";

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
  // 訳さなかったときに戻す、範囲の元の文字列。
  original: string;
}

export interface Prepared {
  masked: string;
  ranges: Range[];
  segments: Segment[];
  headings: string[];
}

export type VariableResolver = (path: string) => string | undefined;

const HTML_TAG_RE = /<\/?[A-Za-z][^>]*>/g;
const LIQUID_RE = /\{%-?[\s\S]*?-?%\}|\{\{[\s\S]*?\}\}/g;
const VARIABLE_RE = /^\{%-?\s*data\s+variables\.([\w.\-]+)\s*-?%\}$/;
const ALERT_RE = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]$/;
const CONTINUATION_PREFIX_RE = /^[ \t]*(?:>[ \t]?)*[ \t]*/;

const parser = unified().use(remarkParse).use(remarkGfm);

// 本文(フロントマターを除いたもの)に、ブロック全体に効く目印を置く。HTMLコメントとLiquidタグ。
export function maskBlocks(body: string, masker: Masker, variables: VariableResolver): string {
  body = body.replace(/<!--[\s\S]*?-->/g, (m) => masker.put("comment", m));
  return body.replace(LIQUID_RE, (tag) => {
    const v = VARIABLE_RE.exec(tag);
    const value = v ? variables(v[1]!) : undefined;
    return value !== undefined ? masker.put("variable", tag, value) : masker.put("liquid", tag);
  });
}

// 断片の中で、モデルに書き換えさせたくない行内の部分を目印にする。
export function maskInline(text: string, masker: Masker): string {
  text = text.replace(/(`+)(?!`)([\s\S]+?)(?<!`)\1(?!`)/g, (m) => masker.put("code", m));
  text = text.replace(/(\]\()(<[^>]*>|[^)\s]+)((?:\s+"[^"]*")?\))/g, (_, a: string, url: string, b: string) => a + masker.put("url", url) + b);
  text = text.replace(/<(?:https?|mailto):[^>\s]+>/g, (m) => masker.put("url", m));
  text = text.replace(/(?<![\w(⟦/"'=])https?:\/\/[^\s<>()\]`]+[^\s<>()\]`.,;:!?'"]/g, (m) => masker.put("url", m));
  return text;
}

export function hasText(text: string): boolean {
  return /[A-Za-z]/.test(text.replace(/⟦[^⟧]*⟧/g, "").replace(HTML_TAG_RE, ""));
}

export function prepare(body: string, masker: Masker, variables: VariableResolver): Prepared {
  const masked = maskBlocks(body, masker, variables);
  const tree = parser.parse(masked) as Root;
  const ranges: Range[] = [];
  const segments: Segment[] = [];
  const headings: string[] = [];

  const add = (start: number, end: number) => {
    const original = masked.slice(start, end);
    let lines = original.split("\n").map((line, i) => (i === 0 ? line : line.replace(CONTINUATION_PREFIX_RE, "")));
    let head = "";
    if (lines.length > 1 && ALERT_RE.test(lines[0]!.trim())) {
      // [!NOTE] の行はそのまま残し、次の行の字下げや > もそのまま残す。
      const second = original.split("\n")[1]!;
      const prefix = CONTINUATION_PREFIX_RE.exec(second)![0];
      head = lines[0] + "\n" + prefix;
      start += lines[0]!.length + 1 + prefix.length;
      lines = lines.slice(1);
    }
    const text = lines.join(" ").trim();
    if (!hasText(text)) return;
    const segment = { id: segments.length + 1, text: maskInline(text, masker) };
    segments.push(segment);
    ranges.push({ start, end, head, segment, original: masked.slice(start, end) });
  };

  const walk = (node: Nodes, parentIsBlockContainer: boolean) => {
    const p = node.position;
    switch (node.type) {
      case "heading":
        headings.push(masker.unmask(toString(node), (m) => (m.kind === "variable" ? m.meaning : m.original)));
        if (p) add(p.start.offset!, p.end.offset!);
        return;
      case "paragraph":
        if (p) add(p.start.offset!, p.end.offset!);
        return;
      case "tableCell": {
        // セルの範囲には前後の | と空白が含まれるので除く。
        if (!p) return;
        const raw = masked.slice(p.start.offset!, p.end.offset!);
        const lead = /^\|?[ \t]*/.exec(raw)![0].length;
        const trail = /[ \t]*\|?[ \t]*$/.exec(raw.slice(lead))![0].length;
        if (raw.length - lead - trail > 0) add(p.start.offset! + lead, p.end.offset! - trail);
        return;
      }
      case "html": {
        // HTMLブロックは行ごとに訳す。行をつなぐとHTMLブロックの終わりが変わるため。
        if (!parentIsBlockContainer || !p) return;
        let offset = p.start.offset!;
        for (const line of masked.slice(p.start.offset!, p.end.offset!).split("\n")) {
          const indent = /^[ \t]*/.exec(line)![0].length;
          if (line.trim()) add(offset + indent, offset + line.trimEnd().length);
          offset += line.length + 1;
        }
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

  // 見出しは # の後ろだけを差し替える。
  for (const r of ranges) {
    const m = /^#{1,6}[ \t]+/.exec(r.original);
    if (m) {
      r.start += m[0].length;
      r.original = r.original.slice(m[0].length);
      r.segment.text = r.segment.text.replace(/^#{1,6}[ \t]+/, "").replace(/[ \t]+#+$/, "");
    }
  }
  return { masked, ranges, segments, headings };
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
