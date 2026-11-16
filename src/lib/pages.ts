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

// サイドバー。訳があるページだけを、原文のサイトごとに並べる。
export function sidebar(pages: Page[]) {
  const groups = new Map<string, { label: string; link: string }[]>();
  for (const p of [...pages].sort((a, b) => a.id.localeCompare(b.id))) {
    const host = p.id.split("/")[0]!;
    const items = groups.get(host) ?? [];
    items.push({ label: p.primary.data.title, link: `/${p.id}/` });
    groups.set(host, items);
  }
  return [...groups].map(([host, items]) => ({ label: HOST_LABELS[host] ?? host, items }));
}
