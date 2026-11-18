/**
 * Workerに渡る、Cloudflareのバインディングと変数。`wrangler.jsonc`の定義に合わせる。
 *
 * 使う部分だけを書く。Cloudflareの型のパッケージ全体は入れない。
 */

export interface D1Binding {
  readonly prepare: (sql: string) => {
    readonly bind: (...values: ReadonlyArray<string | number | null>) => {
      readonly all: () => Promise<{ readonly results: ReadonlyArray<unknown> }>
    }
  }
}

export interface AssetsBinding {
  readonly fetch: (url: string) => Promise<Response>
}

export interface RateLimitBinding {
  readonly limit: (options: { readonly key: string }) => Promise<{ readonly success: boolean }>
}

export interface Env {
  readonly DB: D1Binding
  readonly ASSETS: AssetsBinding
  /** 同じIPからのリクエストの回数の制限。ローカルの実行では無いことがある。 */
  readonly REQUEST_LIMITER?: RateLimitBinding
  readonly TURNSTILE_SITE_KEY: string
  readonly TURNSTILE_SECRET?: string
  readonly GITHUB_REPO: string
  readonly GITHUB_WORKFLOW: string
  readonly GITHUB_REF: string
  readonly GITHUB_DISPATCH_TOKEN?: string
}
