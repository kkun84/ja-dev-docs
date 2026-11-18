import { Effect } from "effect"
import { Agent, setGlobalDispatcher } from "undici"

/**
 * Node.jsの`fetch`の、応答を待つ時間の上限を外す。
 *
 * 推論の長いモデルは、応答の最初のバイトが返るまでに5分を超えることがある。Node.jsのfetchは既定で5分で
 * 打ち切るので、待ち時間の上限は呼び出しごとのタイムアウトだけにする。プロセス全体に効く。
 */
export const disableFetchTimeouts: Effect.Effect<void> = Effect.sync(() => {
  setGlobalDispatcher(new Agent({ headersTimeout: 0, bodyTimeout: 0 }))
})
