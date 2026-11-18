import { Cause, Clock, Effect, Option } from "effect"
import type { Outcome } from "../core/queue.ts"
import { parsePageUrl } from "../core/source.ts"
import { describeCause, type TranslatePageError } from "./errors.ts"
import { JobOutput, Publisher, RequestQueue } from "./ports.ts"
import { translatePage } from "./translate-page.ts"

export interface JobOptions {
  /** 列とは別に訳すページのURL。空なら列を処理する。 */
  readonly urls: ReadonlyArray<string>
  readonly chain: ReadonlyArray<string>
}

// 1回の実行で訳すページの数。
const BATCH = 5
// この時間を過ぎたら、残りのページは訳さずに列に戻す。ジョブの制限時間(60分)の前に、コミットと列への書き込みを済ませるため。
const BUDGET_MILLIS = 40 * 60_000
// ページの間で待つ時間。無料枠の1分あたりの上限を守る。
const PAUSE_BETWEEN_PAGES = "4 seconds"

/** 1ページを訳した結果。 */
interface PageResult {
  readonly page: string
  readonly outcome: Outcome
}

// 訳せなかった理由から、列の行の行き先を決める。
const outcomeOf = (error: TranslatePageError): Outcome => {
  if (error._tag === "PageNotPublishable") {
    return { kind: error.retry ? "requeue" : "failed", reason: error.reason }
  }
  // 原文が無いページは、待っても訳せない。原文のリポジトリや訳文の置き場所の障害は、時間をおけば直る。
  return error._tag === "SourceNotFound" ? { kind: "failed", reason: "source file not found" } : { kind: "requeue", reason: "error" }
}

const translateOne = Effect.fn("translateOne")(function* (page: string, chain: ReadonlyArray<string>) {
  const ref = parsePageUrl(page)
  if (ref === undefined) {
    yield* Effect.logWarning(`unsupported URL: ${page}`)
    return { kind: "failed", reason: "unsupported URL" } satisfies Outcome
  }
  return yield* translatePage(ref, chain).pipe(
    Effect.tap((summary) => Effect.logInfo(JSON.stringify(summary))),
    Effect.as<Outcome>({ kind: "translated" }),
    Effect.catchCause((cause) => {
      // 想定外の欠陥で1ページが落ちても、ほかのページの結果は列に書く。落ちたページは列に戻す。
      const outcome = Option.match(Cause.findErrorOption(cause), {
        onNone: (): Outcome => ({ kind: "requeue", reason: "error" }),
        onSome: outcomeOf
      })
      return Effect.logWarning(`failed: ${page}`, describeCause(cause)).pipe(Effect.as(outcome))
    })
  )
})

/** ページを順に訳し、ページごとの結果を返す。1ページが失敗しても、残りのページを続ける。 */
export const translatePages = Effect.fn("translatePages")(function* (pages: ReadonlyArray<string>, chain: ReadonlyArray<string>) {
  const deadline = (yield* Clock.currentTimeMillis) + BUDGET_MILLIS
  const results: PageResult[] = []
  for (const page of pages) {
    if ((yield* Clock.currentTimeMillis) > deadline) {
      results.push({ page, outcome: { kind: "requeue", reason: "deadline" } })
    } else {
      results.push({ page, outcome: yield* translateOne(page, chain) })
      yield* Effect.sleep(PAUSE_BETWEEN_PAGES)
    }
  }
  return results
})

// pushまで済まなかったら、訳せたページも列に戻す。
const afterPublish = (results: ReadonlyArray<PageResult>, published: boolean): ReadonlyArray<PageResult> =>
  published
    ? results
    : results.map((result) =>
        result.outcome.kind === "translated" ? { ...result, outcome: { kind: "requeue", reason: "push failed" } } : result
      )

// 障害や上限で列に戻したページは、すぐに訳し直しても同じ理由で落ちる。次の実行は、1時間ごとの起動に任せる。
// 制限時間で訳さなかっただけのページは、すぐに次の実行で訳してよい。
const mustWait = (result: PageResult): boolean => result.outcome.kind === "requeue" && result.outcome.reason !== "deadline"

/**
 * GitHub Actionsの翻訳ジョブの本体。
 *
 * 訳すページを決める。入力のURLがあればそれを、無ければ順番待ちの列から取り出す。
 * 訳して訳文を書き、コミットしてpushする。
 * 列に結果を書く。訳せたページは「公開待ち」にする。公開(デプロイ)は別のジョブで行う。
 * 障害や無料枠の上限で訳せなかったページは列に戻し、それ以外の失敗は「失敗」にする。
 * 最後に、公開が要るか、すぐに次の実行を起動するかを、後続のジョブに伝える。
 */
export const runJob = Effect.fn("runJob")(function* (options: JobOptions) {
  const queue = yield* RequestQueue
  const output = yield* JobOutput
  const manual = options.urls.length > 0
  const pages = manual ? options.urls : yield* queue.takeNext(BATCH)

  const translated = yield* translatePages(pages, options.chain)
  const publishing = yield* Effect.exit((yield* Publisher).publish)
  const results = afterPublish(translated, publishing._tag === "Success")

  // 手で指定したページは列に無いので、列には書かない。
  if (!manual) {
    yield* Effect.forEach(results, ({ page, outcome }) => queue.finish(page, outcome), { discard: true })
  }
  const more = !manual && pages.length > 0 && !results.some((result) => mustWait(result)) && (yield* queue.countQueued) > 0
  yield* output.set("publish", String(results.some((result) => result.outcome.kind === "translated")))
  yield* output.set("more", String(more))
  yield* publishing
})
