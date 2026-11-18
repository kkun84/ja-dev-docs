import { describe, expect, it } from "vitest"
import { capture } from "./text.ts"

describe("capture", () => {
  it("グループの文字列を返す", () => {
    expect(capture(/(a)(b)?/.exec("a"), 1)).toBe("a")
  })

  it("一致しないときと、グループが一致に加わらなかったときは空文字を返す", () => {
    expect(capture(/(a)(b)?/.exec("a"), 2)).toBe("")
    expect(capture(/(a)/.exec("x"), 1)).toBe("")
  })
})
