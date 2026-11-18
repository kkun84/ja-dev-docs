import { describe, expect, it } from "vitest"
import { Masker, sortedTokenIds, tokenIds } from "./mask.ts"

describe("Masker", () => {
  it("同じ種からは同じ目印を作る", () => {
    const first = new Masker("seed")
    const second = new Masker("seed")

    expect(first.put("code", "`a`")).toBe(second.put("code", "`a`"))
    expect(new Masker("other").put("code", "`a`")).not.toBe(new Masker("seed").put("code", "`a`"))
  })

  it("どの2つの目印も2文字以上違う", () => {
    const masker = new Masker("many")
    const ids = Array.from({ length: 300 }, (_, index) => tokenIds(masker.put("code", String(index)))[0] ?? "")

    for (const [index, id] of ids.entries()) {
      for (const other of ids.slice(index + 1)) {
        expect(Array.from(id).filter((letter, position) => letter !== other[position]).length).toBeGreaterThanOrEqual(2)
      }
    }
  })

  it("目印を戻す。目印の中の目印も戻す", () => {
    const masker = new Masker("seed")
    const inner = masker.put("code", "`x`")
    const outer = masker.put("liquid", `{% a ${inner} %}`, "tag")

    expect(masker.unmask(`before ${outer} after`)).toBe("before {% a `x` %} after")
    expect(masker.unmask(outer, (masked) => masked.meaning)).toBe("tag")
    expect(masker.unmask("⟦ZZZZ⟧")).toBe("⟦ZZZZ⟧")
    expect(masker.get(tokenIds(inner)[0] ?? "")).toStrictEqual({ kind: "code", original: "`x`", meaning: "`x`" })
  })

  it("1文字違いの目印が1つだけなら直す", () => {
    const masker = new Masker("seed")
    const token = masker.put("code", "`x`")
    const id = tokenIds(token)[0] ?? ""
    const typo = `${id.slice(0, 3)}${id.endsWith("A") ? "B" : "A"}`

    expect(masker.repair(`a ⟦${typo}⟧ b ${token}`)).toBe(`a ${token} b ${token}`)
    expect(masker.repair("⟦TOOLONGID⟧")).toBe("⟦TOOLONGID⟧")
  })
})

describe("目印のID", () => {
  it("出てきた順と、並べ替えた順で返す", () => {
    expect(tokenIds("⟦BBBB⟧ x ⟦AAAA⟧")).toStrictEqual(["BBBB", "AAAA"])
    expect(sortedTokenIds("⟦BBBB⟧ x ⟦AAAA⟧")).toStrictEqual(["AAAA", "BBBB"])
  })
})
