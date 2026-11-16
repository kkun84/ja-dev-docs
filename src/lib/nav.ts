// 原文のサイトと同じ目次を、Starlightのサイドバーにする。
//
// 目次のデータは data/nav/<ホスト>.json(pipeline/nav.ts が原文のリポジトリから作る)。
// 訳があるページはこのサイトの訳へ、無いページは原文のサイトへリンクする。本文のリンクと同じ扱い。

import vscodeNav from "../../data/nav/code.visualstudio.com.json";
import githubNav from "../../data/nav/docs.github.com.json";
import type { Page } from "./pages.ts";

interface NavItem {
  title: string;
  path?: string;
  children?: NavItem[];
}

type SidebarEntry =
  | { label: string; link: string; attrs?: Record<string, string> }
  | { label: string; items: SidebarEntry[]; collapsed?: boolean };

const NAVS: Record<string, Record<string, NavItem[]>> = {
  "code.visualstudio.com": vscodeNav as Record<string, NavItem[]>,
  "docs.github.com": githubNav as Record<string, NavItem[]>,
};

// ページが属する目次の節。VS Codeは docs、api、updates、GitHub Docsは製品(en/copilot なら copilot)。
export function navSection(id: string): { host: string; section: string } {
  const [host = "", ...rest] = id.split("/");
  const section = host === "docs.github.com" ? (rest[1] ?? "") : (rest[0] ?? "");
  return { host, section };
}

export function sectionTitle(id: string): string | undefined {
  const { host, section } = navSection(id);
  return host === "docs.github.com" ? NAVS[host]?.[section]?.[0]?.title : undefined;
}

export function sidebarFor(id: string, pages: Map<string, Page>): SidebarEntry[] {
  const { host, section } = navSection(id);
  const tree = NAVS[host]?.[section];
  if (!tree) return [];
  // GitHub Docsは、製品の最上位の項目の中身を並べる(原文のサイトと同じく、製品名は見出しに出す)。
  const roots = host === "docs.github.com" && tree.length === 1 && tree[0]!.children ? tree[0]!.children : tree;
  const entries = roots.map((item) => toEntry(item, host, id, pages)).filter((e) => !("items" in e) || e.items.length > 0);
  // GitHub Docsは、原文のサイトと同じく、目次の先頭に製品のトップページを置く。
  if (host === "docs.github.com" && tree[0]?.path) {
    const top = `${host}/${tree[0].path}`;
    entries.unshift(pages.has(top) ? { label: tree[0].title, link: `/${top}/`, attrs: { class: "product-top" } } : { label: tree[0].title, link: `https://${top}`, attrs: { class: "product-top untranslated" } });
  }
  return entries;
}

function toEntry(item: NavItem, host: string, current: string, pages: Map<string, Page>): SidebarEntry {
  const link = (it: NavItem, label = it.title): SidebarEntry => {
    const id = `${host}/${it.path}`;
    const page = pages.get(id);
    return page
      ? { label: page.primary.data.title, link: `/${id}/` }
      : { label, link: `https://${id}`, attrs: { class: "untranslated", title: "まだ日本語訳がありません(原文のページを開きます)" } };
  };
  if (!item.children?.length) return item.path ? link(item) : { label: item.title, items: [] };
  // 中身の無い見出し(原文の目次の区切りなど)は出さない。
  const items = item.children.map((c) => toEntry(c, host, current, pages)).filter((e) => !("items" in e) || e.items.length > 0);
  // 目次の見出し自体がページを持つ(GitHub Docsの製品の中の節など)ときは、先頭に「概要」として置く。
  if (item.path) items.unshift(link(item, "Overview"));
  return { label: pages.get(`${host}/${item.path}`)?.primary.data.title ?? item.title, items, collapsed: !contains(item, current, host) };
}

function contains(item: NavItem, current: string, host: string): boolean {
  if (item.path && `${host}/${item.path}` === current) return true;
  return item.children?.some((c) => contains(c, current, host)) ?? false;
}
