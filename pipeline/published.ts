// デプロイが済んだ後に、公開待ちのページを公開済みにする。
import { wranglerD1 } from "./d1.ts";
import { markPublished } from "../src/lib/queue.ts";

await markPublished(wranglerD1());
