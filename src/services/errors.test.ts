import { describe, expect, it } from "vitest"
import { Cause } from "effect"
import { describeCause, PageNotPublishable } from "./errors.ts"

describe("describeCause", () => {
  it("型付きのエラーは、種類と中身を出す", () => {
    expect(describeCause(Cause.fail(new PageNotPublishable({ reason: "quota", retry: true })))).toBe(
      'PageNotPublishable: {"_tag":"PageNotPublishable","reason":"quota","retry":true}'
    )
  })

  it("種類の無い失敗と、想定外の欠陥は、そのまま出す", () => {
    expect(describeCause(Cause.fail("plain"))).toContain("plain")
    expect(describeCause(Cause.die(new Error("bug")))).toContain("bug")
  })
})
