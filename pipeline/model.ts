// 翻訳モデルの呼び出し。モデルには、訳す断片と共通の指示、目印の対応表だけを送る。

import type { Segment } from "./segment.ts";

export const INSTRUCTIONS = `\
You translate English software documentation into Japanese.

The input is a JSON object with "segments", an ordered list of text fragments from one Markdown page. Read them all as one document for context, and translate each fragment.

Return a JSON object with "translations": one entry per input segment, in the same order, with the same "id".

Each fragment may contain:
- Placeholders of the form ⟦K7QM⟧. They stand for code, URLs, product names, and template tags. Copy each one exactly, as many times as it appears in that fragment. The four characters are an arbitrary ID with no meaning.
- When the input has "placeholders", it maps each placeholder ID to the content it stands for. Use it only to understand the sentence, for example to choose the right Japanese particle. Never copy those values into the output; write the placeholder instead.
- Markdown inline syntax: **bold**, _italic_, [link text](⟦K7QM⟧), and inline HTML tags. Keep the syntax and translate the text inside it, including link text that is the title of another page. Keep the HTML tags unchanged.

Style:
- Use polite form (です・ます調). For steps, end sentences with 〜します. Use 〜してください only for warnings or required actions.
- Keep product names, feature names, and UI labels in English as they appear in the source.
- Keep the words "pull request" and "issue" in English.
- A fragment that is only a name or a code-like term may stay as it is.
`;

export interface ModelSpec {
  // 例: gemini-3.5-flash-lite、gemini-3.8-flash@low
  id: string;
}

export interface CallResult {
  translations: Map<number, string>;
  finishReason?: string;
  usage?: unknown;
}

export type Caller = (spec: string, segments: Segment[], legend: Record<string, string>) => Promise<CallResult>;

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent";

export function geminiCaller(apiKey: string, fetchImpl: typeof fetch = fetch): Caller {
  return async (spec, segments, legend) => {
    const [model, level] = spec.split("@") as [string, string | undefined];
    const schema = {
      type: "OBJECT",
      properties: {
        translations: {
          // 項目の数は指定しない。大きな数を指定すると400で拒否されることがあるため。数は受け取った後に検査する。
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: { id: { type: "INTEGER" }, text: { type: "STRING" } },
            required: ["id", "text"],
            propertyOrdering: ["id", "text"],
          },
        },
      },
      required: ["translations"],
    };
    const input = Object.keys(legend).length ? { placeholders: legend, segments } : { segments };
    const body = {
      systemInstruction: { parts: [{ text: INSTRUCTIONS }] },
      contents: [{ role: "user", parts: [{ text: JSON.stringify(input) }] }],
      generationConfig: {
        maxOutputTokens: 65536,
        responseMimeType: "application/json",
        responseSchema: schema,
        ...(level ? { thinkingConfig: { thinkingLevel: level } } : {}),
      },
    };
    let lastError = "";
    for (let attempt = 0; attempt < 4; attempt++) {
      const res = await fetchImpl(GEMINI_URL.replace("{model}", model), {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(600_000),
      });
      const text = await res.text();
      if (res.ok) return parse(JSON.parse(text));
      lastError = `HTTP ${res.status}: ${text.slice(0, 1000)}`;
      if (res.status === 429 && /PerDay/i.test(text)) throw new QuotaExceeded(spec, lastError);
      if (![429, 500, 503].includes(res.status)) break;
      const delay = /"retryDelay":\s*"(\d+)s"/.exec(text);
      await sleep((delay ? Number(delay[1]) + 1 : 30 * (attempt + 1)) * 1000);
    }
    throw new Error(lastError);
  };
}

export class QuotaExceeded extends Error {
  readonly spec: string;
  constructor(spec: string, detail: string) {
    super(`${spec}: daily quota exceeded. ${detail}`);
    this.spec = spec;
  }
}

function parse(data: any): CallResult {
  const candidate = data.candidates?.[0] ?? {};
  const text = (candidate.content?.parts ?? []).filter((p: any) => !p.thought).map((p: any) => p.text ?? "").join("");
  const translations = new Map<number, string>();
  try {
    for (const item of JSON.parse(text).translations ?? []) {
      if (typeof item?.id === "number" && typeof item?.text === "string") translations.set(item.id, item.text);
    }
  } catch {
    // 壊れたJSONは、すべての断片が落ちたものとして扱う。
  }
  return { translations, finishReason: candidate.finishReason, usage: data.usageMetadata };
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
