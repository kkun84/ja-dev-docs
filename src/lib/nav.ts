// 原文のサイトと同じ目次と、現在地までのパンくずを作る。
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

export interface NavNode {
  label: string;
  // 見出しだけでページを持たない項目は undefined。
  href?: string;
  // 訳が無く、原文のサイトへリンクする。
  untranslated: boolean;
  current: boolean;
  // 現在のページを子孫に持つ。
  open: boolean;
  children: NavNode[];
}

export interface Crumb {
  label: string;
  href?: string;
  untranslated: boolean;
}

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

// 目次の最上位。GitHub Docsは製品が1つの項目になっているので、製品そのものを返す。
function roots(id: string): { host: string; items: NavItem[] } {
  const { host, section } = navSection(id);
  return { host, items: NAVS[host]?.[section] ?? [] };
}

export function navTree(id: string, pages: Map<string, Page>): NavNode[] {
  const { host, items } = roots(id);
  const node = (item: NavItem): NavNode => {
    const children = (item.children ?? []).map(node).filter((c) => c.href || c.children.length > 0);
    const page = item.path ? `${host}/${item.path}` : undefined;
    const translated = page ? pages.get(page) : undefined;
    return {
      label: translated?.primary.data.title ?? item.title,
      href: page && (translated ? `/${page}/` : `https://${page}`),
      untranslated: !!page && !translated,
      current: page === id,
      open: contains(item, id, host),
      children,
    };
  };
  return items.map(node).filter((n) => n.href || n.children.length > 0);
}

// 目次の最上位から現在のページまで。現在のページは含めない。
export function breadcrumbs(tree: NavNode[]): Crumb[] {
  const path: NavNode[] = [];
  const walk = (nodes: NavNode[]): boolean => {
    for (const n of nodes) {
      if (n.current) return true;
      if (n.open) {
        path.push(n);
        if (walk(n.children)) return true;
        path.pop();
      }
    }
    return false;
  };
  walk(tree);
  return path.map(({ label, href, untranslated }) => ({ label, href, untranslated }));
}

function contains(item: NavItem, current: string, host: string): boolean {
  if (item.path && `${host}/${item.path}` === current) return true;
  return item.children?.some((c) => contains(c, current, host)) ?? false;
}
