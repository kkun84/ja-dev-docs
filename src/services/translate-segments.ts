import { Clock, Effect } from "effect"
import type { ModelOutput } from "../core/gemini.ts"
import { parseSpec } from "../core/model.ts"
import { judge, legendFor, type PagePlan } from "../core/page.ts"
import type { StepLog } from "../core/record.ts"
import type { Segment } from "../core/segment.ts"
import { type ModelRequestFailed, QuotaExceeded } from "./errors.ts"
import { CallBudget, Translator } from "./ports.ts"

// 断片が多いと、モデルの出力の上限や要求の大きさの上限にかかる。1回に送る断片の数を抑え、
// それでも要求が拒否されたら半分に分けて送り直す。文脈が切れすぎないよう、1回の上限は大きめにする。
const BATCH = 120
const BAD_REQUEST = 400
const MILLIS_PER_SECOND = 1000

type CallError = QuotaExceeded | ModelRequestFailed

const chunks = <T>(items: ReadonlyArray<T>, size: number): ReadonlyArray<ReadonlyArray<T>> =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, index) => items.slice(index * size, (index + 1) * size))

const merge = (outputs: ReadonlyArray<ModelOutput>): ModelOutput => ({
  translations: new Map(outputs.flatMap((output) => [...output.translations])),
  finishReason: outputs.map((output) => output.finishReason).find((reason) => reason !== "STOP") ?? "STOP"
})

// 呼ぶ前にその日の回数の枠を使い、上限を超えるなら呼ばずに上限として扱う。
const callOnce = Effect.fn("callOnce")(function* (plan: PagePlan, spec: string, segments: ReadonlyArray<Segment>) {
  if (!(yield* (yield* CallBudget).reserve(parseSpec(spec).model))) {
    return yield* new QuotaExceeded({ spec, detail: "local daily limit" })
  }
  return yield* (yield* Translator).translate(spec, segments, legendFor(plan, segments))
})

const callInBatches = (
  plan: PagePlan,
  spec: string,
  segments: ReadonlyArray<Segment>
): Effect.Effect<ModelOutput, CallError, CallBudget | Translator> => {
  const split = (parts: ReadonlyArray<ReadonlyArray<Segment>>) =>
    Effect.forEach(parts, (part) => callInBatches(plan, spec, part)).pipe(Effect.map(merge))
  if (segments.length > BATCH) {
    return split(chunks(segments, BATCH))
  }
  return callOnce(plan, spec, segments).pipe(
    Effect.catchTag("ModelRequestFailed", (error) =>
      error.status === BAD_REQUEST && segments.length >= 2 ? split(chunks(segments, Math.ceil(segments.length / 2))) : Effect.fail(error)
    )
  )
}

// 公開リポジトリに記録が残るので、APIの応答の本文は書かず、種類と状態コードだけを書く。
const describeError = (error: CallError): string => {
  if (error._tag === "QuotaExceeded") {
    return "quota"
  }
  return `request: ${error.status === undefined ? "failed" : `HTTP ${error.status}`}`
}

/** 断片ごとの訳と、どのモデルの訳を採ったか、手順ごとの結果。 */
interface SegmentsResult {
  readonly done: ReadonlyMap<number, string>
  /** 断片の番号と、その訳を採ったモデル。訳せず原文のまま残した断片は含まない。 */
  readonly usedModel: ReadonlyMap<number, string>
  readonly steps: ReadonlyArray<StepLog>
}

interface StepOutcome {
  readonly accepted: ReadonlyMap<number, string>
  readonly log: Omit<StepLog, "seconds">
}

// 1つの指定のモデルで、まだ訳せていない断片を訳す。モデルを呼べなかったら、すべての断片が落ちたものとして続ける。
const runStep = (
  plan: PagePlan,
  spec: string,
  pending: ReadonlyArray<Segment>
): Effect.Effect<StepOutcome, never, CallBudget | Translator> =>
  callInBatches(plan, spec, pending).pipe(
    Effect.map((output): StepOutcome => {
      const verdict = judge(plan, pending, output.translations)
      return { accepted: verdict.accepted, log: { spec, sent: pending.length, failed: verdict.failed, finishReason: output.finishReason } }
    }),
    Effect.catch((error) => {
      const reason = error._tag === "QuotaExceeded" ? "quota" : "request"
      const failed = pending.map((segment) => ({ id: segment.id, errors: [reason] }))
      return Effect.succeed<StepOutcome>({ accepted: new Map(), log: { spec, sent: pending.length, failed, error: describeError(error) } })
    })
  )

/** `chain`の順にモデルを使い、検査に落ちた断片だけを次へ回す。 */
export const translateSegments = Effect.fn("translateSegments")(function* (plan: PagePlan, chain: ReadonlyArray<string>) {
  const done = new Map<number, string>()
  const usedModel = new Map<number, string>()
  const steps: StepLog[] = []
  let pending = plan.segments
  for (const spec of chain) {
    if (pending.length === 0) {
      break
    }
    const started = yield* Clock.currentTimeMillis
    const { accepted, log } = yield* runStep(plan, spec, pending)
    for (const [id, text] of accepted) {
      done.set(id, text)
      usedModel.set(id, parseSpec(spec).model)
    }
    steps.push({ ...log, seconds: ((yield* Clock.currentTimeMillis) - started) / MILLIS_PER_SECOND })
    pending = pending.filter((segment) => !done.has(segment.id))
  }
  const result: SegmentsResult = { done, usedModel, steps }
  return result
})
