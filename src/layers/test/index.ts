import { Context, Effect, Layer, Option, Ref } from "effect"
import type { ModelOutput } from "../../core/gemini.ts"
import type { Segment } from "../../core/segment.ts"
import {
  BotCheckNotConfigured,
  type ModelRequestFailed,
  PublishFailed,
  type QuotaExceeded,
  SourceUnavailable,
  StoreFailed
} from "../../services/errors.ts"
import {
  BotCheck,
  CallBudget,
  JobOutput,
  PublishedPages,
  Publisher,
  RateLimiter,
  RequestQueue,
  SourceRepository,
  TranslationStore,
  Translator,
  WorkflowDispatcher,
  type StoredTranslation
} from "../../services/ports.ts"
import { requestQueueLayer } from "../d1/queue.ts"
import { memoryD1Client } from "./sqlite.ts"

type Translate = (
  spec: string,
  segments: ReadonlyArray<Segment>,
  legend: Readonly<Record<string, string>>
) => Effect.Effect<ModelOutput, QuotaExceeded | ModelRequestFailed>

/** 断片の文頭に「訳」を付けるだけの偽の翻訳。目印やHTMLタグは保つ。HTMLの行では、先頭のタグの後ろに付ける。 */
export const fakeTranslation = (segments: ReadonlyArray<Segment>): ModelOutput => ({
  translations: new Map(segments.map((segment) => [segment.id, segment.text.replace(/^((?:<[^>]+>)*)/, "$1訳")])),
  finishReason: "STOP"
})

export interface TestOptions {
  /** 原文のリポジトリのファイル。キーは`owner/name:path`。どの版でも同じ中身を返す。 */
  readonly files?: Readonly<Record<string, string>>
  /** 原文のブランチの最新のコミット。`null`なら取得できない。 */
  readonly commit?: string | null
  /** 読もうとすると障害で失敗するファイル。キーは`files`と同じ形。 */
  readonly unreadable?: ReadonlyArray<string>
  /** 翻訳モデル。渡さなければ`fakeTranslation`。 */
  readonly translate?: Translate
  /** モデルごとの、その日に呼べる残りの回数。書いていないモデルは何回でも呼べる。 */
  readonly budget?: Readonly<Record<string, number>>
  /** 用語集のYAML。 */
  readonly glossary?: string
  /** 最初から保存してある訳文。 */
  readonly stored?: ReadonlyArray<StoredTranslation>
  readonly failWrites?: boolean
  readonly failPublish?: boolean
  /** bot判定の結果。`"not-configured"`なら、秘密鍵が登録されていない。 */
  readonly human?: boolean | "not-configured"
  readonly rateLimited?: boolean
  /** 公開済みのページ。 */
  readonly published?: ReadonlyArray<string>
}

/** テストの後で確かめる、起きたことの記録。 */
interface TestRecord {
  /** 書いた訳文。キーは置き場所からの相対パス。 */
  readonly written: ReadonlyMap<string, { readonly markdown: string; readonly record: string }>
  /** 翻訳モデルを呼んだ指定と、渡した断片の番号。 */
  readonly calls: ReadonlyArray<{
    readonly spec: string
    readonly ids: ReadonlyArray<number>
    readonly legend: Readonly<Record<string, string>>
  }>
  /** 原文のリポジトリから読もうとしたファイル。 */
  readonly reads: ReadonlyArray<string>
  readonly publishes: number
  readonly dispatches: number
  readonly outputs: Readonly<Record<string, string>>
}

/** 記録を読み出すためのサービス。テスト用の層だけが提供する。 */
export class TestRecorder extends Context.Service<TestRecorder, { readonly read: Effect.Effect<TestRecord> }>()(
  "ja-dev-docs/TestRecorder"
) {}

export type TestServices =
  | SourceRepository
  | Translator
  | CallBudget
  | RequestQueue
  | TranslationStore
  | Publisher
  | JobOutput
  | BotCheck
  | RateLimiter
  | PublishedPages
  | WorkflowDispatcher
  | TestRecorder

const sourceLayer = (options: TestOptions, record: Ref.Ref<TestRecord>) =>
  Layer.succeed(SourceRepository, {
    latestCommit: () => Effect.succeed(Option.fromNullOr(options.commit === undefined ? "c0ffee" : options.commit)),
    read: (repo, revision, file) => {
      const key = `${repo}:${file}`
      const result =
        options.unreadable?.includes(key) === true
          ? Effect.fail(new SourceUnavailable({ url: `${repo}/${revision}/${file}`, detail: "test" }))
          : Effect.succeed(Option.fromUndefinedOr(options.files?.[key]))
      return Ref.update(record, (current) => ({ ...current, reads: [...current.reads, `${key}@${revision}`] })).pipe(Effect.andThen(result))
    }
  })

const modelLayers = (options: TestOptions, record: Ref.Ref<TestRecord>) =>
  Layer.mergeAll(
    Layer.succeed(Translator, {
      translate: (spec, segments, legend) =>
        Ref.update(record, (current) => ({
          ...current,
          calls: [...current.calls, { spec, ids: segments.map((segment) => segment.id), legend }]
        })).pipe(Effect.andThen(options.translate?.(spec, segments, legend) ?? Effect.succeed(fakeTranslation(segments))))
    }),
    Layer.unwrap(
      Ref.make<Readonly<Record<string, number>>>(options.budget ?? {}).pipe(
        Effect.map((remaining) =>
          Layer.succeed(CallBudget, {
            reserve: (model) =>
              Ref.modify(remaining, (current) => {
                const left = current[model]
                return left === undefined ? [true, current] : [left > 0, { ...current, [model]: left - 1 }]
              })
          })
        )
      )
    )
  )

const storeLayers = (options: TestOptions, record: Ref.Ref<TestRecord>) =>
  Layer.mergeAll(
    Layer.succeed(TranslationStore, {
      write: (path, markdown, json) =>
        options.failWrites === true
          ? Effect.fail(new StoreFailed({ path, detail: "test" }))
          : Ref.update(record, (current) => ({ ...current, written: new Map(current.written).set(path, { markdown, record: json }) })),
      list: Effect.succeed(options.stored ?? []),
      glossary: Effect.succeed(options.glossary ?? "code.visualstudio.com: {}\ndocs.github.com: {}\n")
    }),
    Layer.succeed(Publisher, {
      publish:
        options.failPublish === true
          ? Effect.fail(new PublishFailed({ detail: "test" }))
          : Ref.update(record, (current) => ({ ...current, publishes: current.publishes + 1 }))
    }),
    Layer.succeed(JobOutput, {
      set: (name, value) => Ref.update(record, (current) => ({ ...current, outputs: { ...current.outputs, [name]: value } }))
    })
  )

const edgeLayers = (options: TestOptions, record: Ref.Ref<TestRecord>) =>
  Layer.mergeAll(
    Layer.succeed(BotCheck, {
      verify: () => (options.human === "not-configured" ? Effect.fail(new BotCheckNotConfigured()) : Effect.succeed(options.human ?? true))
    }),
    Layer.succeed(RateLimiter, { allow: () => Effect.succeed(options.rateLimited !== true) }),
    Layer.succeed(PublishedPages, { has: (page) => Effect.succeed(options.published?.includes(page) === true) }),
    Layer.succeed(WorkflowDispatcher, { dispatch: Ref.update(record, (current) => ({ ...current, dispatches: current.dispatches + 1 })) })
  )

/**
 * 外の世界の代わりにメモリ上で動く層。
 *
 * 順番待ちの列だけは、本番と同じSQLを、マイグレーションを当てたメモリ上のSQLiteに実行する。
 */
export const testLayer = (options: TestOptions = {}): Layer.Layer<TestServices> =>
  Layer.unwrap(
    Effect.gen(function* () {
      const record = yield* Ref.make<TestRecord>({ written: new Map(), calls: [], reads: [], publishes: 0, dispatches: 0, outputs: {} })
      return Layer.mergeAll(
        sourceLayer(options, record),
        modelLayers(options, record),
        storeLayers(options, record),
        edgeLayers(options, record),
        requestQueueLayer(memoryD1Client()),
        Layer.succeed(TestRecorder, { read: Ref.get(record) })
      )
    })
  )
