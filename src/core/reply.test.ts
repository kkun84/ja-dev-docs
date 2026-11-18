import { describe, expect, it } from "vitest"
import type { RequestStatus } from "./queue.ts"
import { PUBLISHED_REPLY, REJECTIONS, statusReply } from "./reply.ts"

describe("statusReply", () => {
  it("列の行の状況に、公開されているかを足す", () => {
    expect(statusReply({ state: "queued", position: 2 }, false)).toStrictEqual({ state: "queued", position: 2, published: false })
  })

  it("リクエストされたことが無ければ、状況は付けない", () => {
    const never: ReadonlyMap<string, RequestStatus> = new Map()

    expect(statusReply(never.get("none"), true)).toStrictEqual({ published: true })
  })

  it("公開済みのページへのリクエストには、公開済みと答える", () => {
    expect(PUBLISHED_REPLY).toStrictEqual({ state: "done", published: true })
  })
})

describe("REJECTIONS", () => {
  it("受け付けなかった理由は、どれも4xxか5xxで答える", () => {
    for (const { status, message } of Object.values(REJECTIONS)) {
      expect(status).toBeGreaterThanOrEqual(400)
      expect(message).not.toBe("")
    }
  })
})
