/** HTTPの要求を送る関数。Node.jsとWorkerの`fetch`を、そのまま渡せる。 */
export type Fetch = (url: string, init?: RequestInit) => Promise<Response>

/** 応答を待つ時間の上限を付ける。 */
export const withTimeout = (init: RequestInit, millis: number): RequestInit => ({ ...init, signal: AbortSignal.timeout(millis) })
