import { getCollection, type CollectionEntry } from "astro:content";
import { MODEL_ORDER } from "./translations-loader.ts";

export type Variant = CollectionEntry<"translations">;

export interface Page {
  id: string;
  variants: Variant[];
  // 既定の訳。訳せなかった断片が少ないものを選び、同じならMODEL_ORDERの順。
  primary: Variant;
}

export async function getPages(): Promise<Page[]> {
  const byPage = new Map<string, Variant[]>();
  for (const v of await getCollection("translations")) {
    const list = byPage.get(v.data.page) ?? [];
    list.push(v);
    byPage.set(v.data.page, list);
  }
  return [...byPage].map(([id, variants]) => {
    variants.sort((a, b) => a.data.record.untranslated.length - b.data.record.untranslated.length || rank(a) - rank(b));
    return { id, variants, primary: variants[0]! };
  });
}

const rank = (v: Variant) => {
  const i = MODEL_ORDER.indexOf(v.data.record.model);
  return i < 0 ? MODEL_ORDER.length : i;
};

const HOST_LABELS: Record<string, string> = { "code.visualstudio.com": "VS Code", "docs.github.com": "GitHub Docs" };

// ページが属する節。VS Codeは docs/agents のように2階層、GitHub Docsは en/copilot のように2階層までで区切る。
export function sectionOf(id: string): string {
  return id.split("/").slice(0, 3).join("/");
}

// サイドバー。同じ節のページだけを並べる。全ページを並べると、1ページ足すたびに全ページのHTMLが変わり、
// サイトの大きさがページ数の2乗で増えるため。全ページの一覧は /list/ に置く。
export function sidebar(pages: Page[], current: string) {
  const section = sectionOf(current);
  const host = current.split("/")[0]!;
  const items = pages
    .filter((p) => sectionOf(p.id) === section)
    .sort((a, b) => a.id.localeCompare(b.id))
    .slice(0, 200)
    .map((p) => ({ label: p.primary.data.title, link: `/${p.id}/` }));
  return [
    { label: "訳したページの一覧", link: "/list/" },
    { label: `${HOST_LABELS[host] ?? host}: ${section.split("/").slice(1).join("/")}`, items },
  ];
}

export function hostLabel(host: string): string {
  return HOST_LABELS[host] ?? host;
}
