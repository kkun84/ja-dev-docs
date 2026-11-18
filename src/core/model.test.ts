import { describe, expect, it } from "vitest"
import { DEFAULT_CHAIN, dailyLimit, modelLabel, mostCommon, parseSpec } from "./model.ts"

describe("モデルの指定", () => {
  it("モデルのIDと推論の量に分ける", () => {
    expect(parseSpec("gemini-3.8-flash@low")).toStrictEqual({ model: "gemini-3.8-flash", level: "low" })
    expect(parseSpec("gemini-3.5-flash-lite")).toStrictEqual({ model: "gemini-3.5-flash-lite", level: undefined })
  })

  it("既定の順のモデルには、すべて1日の上限がある", () => {
    for (const spec of DEFAULT_CHAIN) {
      expect(dailyLimit(parseSpec(spec).model)).toBeGreaterThan(0)
    }
  })

  it("上限を決めていないモデルは呼ばない", () => {
    expect(dailyLimit("unknown-model")).toBe(0)
  })

  it("読者に見せる名前にする", () => {
    expect(modelLabel("gemini-3.5-flash-lite")).toBe("Gemini 3.5 Flash-Lite")
    expect(modelLabel("unknown-model")).toBe("unknown-model")
  })
})

describe("mostCommon", () => {
  it("いちばん多い値を返し、同数なら先に出てきたものを返す", () => {
    expect(mostCommon(["a", "b", "b"])).toBe("b")
    expect(mostCommon(["a", "b"])).toBe("a")
    expect(mostCommon([])).toBeUndefined()
  })
})
