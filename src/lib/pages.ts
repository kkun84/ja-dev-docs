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

// 原文のサイトごとの名前。
export const SITES = {
  "code.visualstudio.com": { kind: "vscode", label: "Visual Studio Code" },
  "docs.github.com": { kind: "github", label: "GitHub Docs" },
} as const;

export function hostLabel(host: string): string {
  return SITES[host as keyof typeof SITES]?.label ?? host;
}
