// GitHub ActionsからD1を読み書きする。wranglerのCLIを通すので、Cloudflareの認証はAPIトークンだけで済む。

import { execFileSync } from "node:child_process";
import type { D1Like } from "../src/lib/queue.ts";

const DATABASE = "ja-dev-docs";

export function wranglerD1(): D1Like {
  return {
    prepare(sql) {
      return {
        bind(...values) {
          // wranglerのコマンドは値の束縛ができないので、文字列と数値をSQLのリテラルにして埋め込む。
          const inlined = sql.replace(/\?(\d+)/g, (_, n: string) => literal(values[Number(n) - 1]));
          const exec = () => {
            const out = execFileSync("pnpm", ["exec", "wrangler", "d1", "execute", DATABASE, "--remote", "--json", "--command", inlined], { encoding: "utf8" });
            return (JSON.parse(out) as { results: unknown[] }[])[0]?.results ?? [];
          };
          return {
            run: async () => exec(),
            first: async <T,>() => ((exec()[0] as T) ?? null),
            all: async <T,>() => ({ results: exec() as T[] }),
          };
        },
      };
    },
  };
}

export function literal(v: unknown): string {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  return `'${String(v).replace(/'/g, "''")}'`;
}
