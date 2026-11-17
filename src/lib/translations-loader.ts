// content/ の訳文を読み、ページごとのモデル別の訳としてAstroのコレクションに入れる。
//
// content/<ホスト>/<パス>/<モデル>.md が訳文、同じ名前の .json がその記録。

import type { Loader } from "astro/loaders";
import { readdir, readFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import GithubSlugger from "github-slugger";
import { rewriteHtmlLinks, type PageRecord } from "./links.ts";

export interface TranslationRecord extends PageRecord {
  model: string;
  translatedAt: string;
  segments: number;
  segmentsByModel: Record<string, number>;
  untranslated: number[];
  headings: string[];
}

// 既定のモデルを選ぶ順。前にあるものほど優先する。
export const MODEL_ORDER = ["gemini-3.5-flash-lite", "gemini-3.8-flash", "plamo-3.1-prime", "plamo-3-translate-8b"];

export const MODEL_LABELS: Record<string, string> = {
  "gemini-3.5-flash-lite": "Gemini 3.5 Flash-Lite",
  "gemini-3.8-flash": "Gemini 3.8 Flash",
  "plamo-3.1-prime": "PLaMo 3.1 Prime",
  "plamo-3-translate-8b": "PLaMo 3 Translate 8B",
};

export function translationsLoader(dir = "content"): Loader {
  return {
    name: "translations",
    async load({ store, renderMarkdown, logger }) {
      store.clear();
      const all = await readdir(dir, { recursive: true }).catch(() => [] as string[]);
      const files = all.filter((f) => f.endsWith(".json")).map((f) => join(dir, f));
      const pages = new Set(files.map((f) => pageOf(dir, f)));
      for (const json of files) {
        const record = JSON.parse(await readFile(json, "utf8")) as TranslationRecord;
        const page = pageOf(dir, json);
        const raw = await readFile(json.replace(/\.json$/, ".md"), "utf8");
        const { front, body } = splitFrontMatter(raw);
        let markdown = body;
        let title = front.title ?? front.PageTitle;
        const h1 = /^\s*# (.+)\n/.exec(markdown);
        let headings = record.headings;
        if (h1) {
          title ??= h1[1]!.replace(/<!--[\s\S]*?-->/g, "").trim();
          markdown = markdown.slice(h1[0].length);
          headings = headings.slice(1);
        }
        markdown = cjkUnderscoreEmphasis(alertsToCallouts(markdown));
        const rendered = await renderMarkdown(markdown);
        rendered.html = rewriteHtmlLinks(rendered.html, record, pages);
        fixHeadingIds(rendered, headings);
        store.set({
          id: `${page}/${record.model}`,
          data: { page, title: title ?? page, description: front.intro ?? front.MetaDescription, record },
          rendered,
        });
      }
      logger.info(`${files.length} translations of ${pages.size} pages`);
    },
  };
}

function pageOf(dir: string, json: string): string {
  return relative(dir, json).split(sep).slice(0, -1).join("/");
}

function splitFrontMatter(text: string): { front: Record<string, string>; body: string } {
  const m = /^---\n([\s\S]*?)\n---\n/.exec(text);
  const front: Record<string, string> = {};
  if (!m) return { front, body: text };
  for (const line of m[1]!.split("\n")) {
    const kv = /^(\w+):[ \t]+(.+)$/.exec(line);
    if (!kv) continue;
    let v = kv[2]!.trim();
    if (v.startsWith('"')) {
      try {
        v = JSON.parse(v);
      } catch {}
    } else v = v.replace(/^'(.*)'$/, "$1").replace(/''/g, "'");
    front[kv[1]!] = v;
  }
  return { front, body: text.slice(m[0].length) };
}

// 見出しのIDを、訳した見出しではなく原文の見出しから作る。原文のIDを指すリンクが切れないように。
function fixHeadingIds(rendered: { html: string; metadata?: { headings?: { depth: number; slug: string; text: string }[] } }, originals: string[]) {
  const slugger = new GithubSlugger();
  const ids = originals.map((h) => slugger.slug(h));
  let i = 0;
  const map = new Map<string, string>();
  rendered.html = rendered.html.replace(/<h([1-6])([^>]*?) id="([^"]*)"/g, (all, level: string, attrs: string, id: string) => {
    const next = ids[i++];
    if (!next) return all;
    map.set(id, next);
    return `<h${level}${attrs} id="${next}"`;
  });
  for (const h of rendered.metadata?.headings ?? []) h.slug = map.get(h.slug) ?? h.slug;
}

const CALLOUT_TITLES: Record<string, string> = {
  NOTE: "メモ",
  TIP: "ヒント",
  IMPORTANT: "重要",
  WARNING: "警告",
  CAUTION: "注意",
};

// GitHubのアラート(> [!NOTE])を、種類ごとに見た目を変えられるHTMLにする。リストの中の字下げにも対応する。
// 中身はMarkdownのまま残すため、前後に空行を入れる。
export function alertsToCallouts(markdown: string): string {
  const lines = markdown.split("\n");
  const out: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const m = /^([ \t]*)>[ \t]?\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*$/.exec(lines[i]!);
    if (!m) {
      out.push(lines[i]!);
      continue;
    }
    const indent = m[1]!;
    const kind = m[2]!.toLowerCase();
    const title = CALLOUT_TITLES[m[2]!]!;
    const body: string[] = [];
    while (i + 1 < lines.length && lines[i + 1]!.startsWith(indent + ">")) body.push(indent + lines[++i]!.slice(indent.length + 1).replace(/^[ \t]/, ""));
    out.push(
      `${indent}<div class="callout callout--${kind}"><p class="callout-title">${title}</p><div class="callout-content">`,
      "",
      ...body,
      "",
      `${indent}</div></div>`,
    );
  }
  return out.join("\n");
}

const CJK_CHAR = "[\\u3000-\\u30ff\\u3400-\\u9fff\\uff00-\\uffef]";
const UNDERSCORE_EMPHASIS = new RegExp(`(?<=${CJK_CHAR})_([^_\\s][^_\\n]*?)_|_([^_\\s][^_\\n]*?)_(?=${CJK_CHAR})`, "g");

// 日本語に隣接した _強調_ は、CommonMarkでは単語の途中とみなされ強調にならない(remark-cjk-friendlyも * だけを扱う)。
// コードの外の _…_ を *…* に置き換える。訳文では、英語の _owner_ が「_所有者_と」のように日本語に挟まれるため。
export function cjkUnderscoreEmphasis(markdown: string): string {
  let inFence = false;
  return markdown
    .split("\n")
    .map((line) => {
      if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
      if (inFence) return line;
      return line
        .split(/(`+[^`]*`+)/)
        .map((part, i) => (i % 2 ? part : part.replace(UNDERSCORE_EMPHASIS, (_m, a?: string, b?: string) => `*${a ?? b}*`)))
        .join("");
    })
    .join("\n");
}
