import { describe, expect, it } from "vitest"
import { SECURITY_HEADERS, untranslatedPage } from "./request-page.ts"

describe("untranslatedPage", () => {
  it("原文へのリンクと、リクエストのボタンを出す", () => {
    const html = untranslatedPage("code.visualstudio.com/docs/a", "site-key")

    expect(html).toContain('<a href="https://code.visualstudio.com/docs/a">原文(英語)を読む</a>')
    expect(html).toContain('data-page="code.visualstudio.com/docs/a"')
    expect(html).toContain('data-sitekey="site-key"')
    expect(html).toContain('<meta name="robots" content="noindex">')
  })

  it("ページの場所とサイトキーを、HTMLとして解釈させない", () => {
    const html = untranslatedPage('x"><script>alert(1)</script>', "k'&")

    expect(html).not.toContain("<script>alert(1)</script>")
    expect(html).toContain('data-page="x&#34;&#62;&#60;script&#62;alert(1)&#60;/script&#62;"')
    expect(html).toContain('data-sitekey="k&#39;&#38;"')
  })
})

describe("SECURITY_HEADERS", () => {
  it("Turnstile以外の外部のスクリプトを許さない", () => {
    expect(SECURITY_HEADERS["content-security-policy"]).toContain("script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com;")
    expect(SECURITY_HEADERS["x-content-type-options"]).toBe("nosniff")
  })
})
