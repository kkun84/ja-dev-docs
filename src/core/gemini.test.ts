import { describe, expect, it } from "vitest"
import { classifyGeminiFailure, geminiRequest, INSTRUCTIONS, parseGeminiResponse } from "./gemini.ts"

const reply = (text: string, extra: object = {}): string =>
  JSON.stringify({
    candidates: [{ content: { parts: [{ text }] }, finishReason: "STOP", ...extra }],
    usageMetadata: { totalTokenCount: 3 }
  })

describe("geminiRequest", () => {
  it("モデルのIDをURLに入れ、断片と指示を本文に入れる", () => {
    const request = geminiRequest("gemini-3.5-flash-lite", [{ id: 1, text: "Hello" }], {})

    expect(request.url).toBe("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent")
    expect(JSON.parse(request.body)).toMatchObject({
      systemInstruction: { parts: [{ text: INSTRUCTIONS }] },
      contents: [{ role: "user", parts: [{ text: '{"segments":[{"id":1,"text":"Hello"}]}' }] }],
      generationConfig: { responseMimeType: "application/json" }
    })
    expect(request.body).not.toContain("thinkingConfig")
  })

  it("推論の量の指定と、目印の対応表を入れる", () => {
    const request = geminiRequest("gemini-3.8-flash@low", [{ id: 1, text: "⟦AAAA⟧" }], { AAAA: "`code`" })

    expect(request.url).toContain("/gemini-3.8-flash:generateContent")
    expect(JSON.parse(request.body)).toMatchObject({
      contents: [{ parts: [{ text: '{"placeholders":{"AAAA":"`code`"},"segments":[{"id":1,"text":"⟦AAAA⟧"}]}' }] }],
      generationConfig: { thinkingConfig: { thinkingLevel: "low" } }
    })
  })
})

describe("parseGeminiResponse", () => {
  it("訳を番号ごとに取り出す", () => {
    const output = parseGeminiResponse(
      reply(
        JSON.stringify({
          translations: [
            { id: 1, text: "こんにちは" },
            { id: 2, text: "世界" }
          ]
        })
      )
    )

    expect([...output.translations]).toStrictEqual([
      [1, "こんにちは"],
      [2, "世界"]
    ])
    expect(output.finishReason).toBe("STOP")
  })

  it("推論の過程は訳に含めず、分かれた本文はつなぐ", () => {
    const body = JSON.stringify({
      candidates: [
        { content: { parts: [{ text: "thinking", thought: true }, { text: '{"translations":[{"id":1,' }, { text: '"text":"訳"}]}' }] } }
      ]
    })

    expect([...parseGeminiResponse(body).translations]).toStrictEqual([[1, "訳"]])
  })

  it("形の合わない項目だけを捨てる", () => {
    const output = parseGeminiResponse(
      reply(JSON.stringify({ translations: [{ id: "1", text: "x" }, { id: 2 }, { id: 3, text: "訳" }, "x"] }))
    )

    expect([...output.translations]).toStrictEqual([[3, "訳"]])
  })

  it.each([
    ["JSONでない応答", "<html>"],
    ["候補が無い応答", "{}"],
    ["本文が無い候補", JSON.stringify({ candidates: [{ finishReason: "SAFETY" }] })],
    ["途中で切れた訳", reply('{"translations":[{"id":1,"text":"途中', { finishReason: "MAX_TOKENS" })],
    ["訳の配列が無い訳", reply("{}")]
  ])("%sは、訳が1つも無いものとして扱う", (_name, body) => {
    expect(parseGeminiResponse(body).translations.size).toBe(0)
  })

  it("出力の上限で切れたことを、止まった理由として返す", () => {
    expect(parseGeminiResponse(reply("{", { finishReason: "MAX_TOKENS" })).finishReason).toBe("MAX_TOKENS")
  })
})

describe("classifyGeminiFailure", () => {
  it("1日の上限は、その日はもう呼ばない", () => {
    expect(classifyGeminiFailure(429, '{"quotaId":"GenerateRequestsPerDayPerProjectPerModel-FreeTier"}')).toStrictEqual({ kind: "quota" })
  })

  it("1分の上限と一時的な障害は、待ってやり直す", () => {
    expect(classifyGeminiFailure(429, '{"quotaId":"PerMinute","retryDelay": "17s"}')).toStrictEqual({ kind: "retry", delaySeconds: 17 })
    expect(classifyGeminiFailure(503, "overloaded")).toStrictEqual({ kind: "retry", delaySeconds: undefined })
    expect(classifyGeminiFailure(500, "")).toStrictEqual({ kind: "retry", delaySeconds: undefined })
  })

  it("要求の誤りは、待っても通らない", () => {
    expect(classifyGeminiFailure(400, "too large")).toStrictEqual({ kind: "fatal" })
    expect(classifyGeminiFailure(403, "PerDay")).toStrictEqual({ kind: "fatal" })
  })
})
