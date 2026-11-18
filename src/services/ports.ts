import { Context } from "effect"
import type { Effect, Option } from "effect"
import type { ModelOutput } from "../core/gemini.ts"
import type { Outcome, RequestStatus } from "../core/queue.ts"
import type { Segment } from "../core/segment.ts"
import type {
  BotCheckNotConfigured,
  ModelRequestFailed,
  PublishFailed,
  QueueUnavailable,
  QuotaExceeded,
  SourceUnavailable,
  StoreFailed
} from "./errors.ts"

/** 原文のリポジトリ(GitHub)。 */
export class SourceRepository extends Context.Service<
  SourceRepository,
  {
    /** ブランチの最新のコミット。取得できなければ`None`。訳文がどの版の原文から作られたかを記録するのに使う。 */
    readonly latestCommit: (repo: string, branch: string) => Effect.Effect<Option.Option<string>>
    /** ファイルの中身。ファイルが無ければ`None`。`revision`はブランチ名かコミット。 */
    readonly read: (repo: string, revision: string, file: string) => Effect.Effect<Option.Option<string>, SourceUnavailable>
  }
>()("ja-dev-docs/SourceRepository") {}

/** 翻訳モデル。断片と、目印の対応表を渡して、断片ごとの訳を受け取る。 */
export class Translator extends Context.Service<
  Translator,
  {
    readonly translate: (
      spec: string,
      segments: ReadonlyArray<Segment>,
      legend: Readonly<Record<string, string>>
    ) => Effect.Effect<ModelOutput, QuotaExceeded | ModelRequestFailed>
  }
>()("ja-dev-docs/Translator") {}

/** 翻訳モデルを呼んでよいかを決める、1日の回数の枠。 */
export class CallBudget extends Context.Service<
  CallBudget,
  {
    /** 1回分を使う。その日の上限を超えるなら`false`で、呼んではいけない。 */
    readonly reserve: (model: string) => Effect.Effect<boolean>
  }
>()("ja-dev-docs/CallBudget") {}

/** 翻訳リクエストの順番待ちの列。 */
export class RequestQueue extends Context.Service<
  RequestQueue,
  {
    /** リクエストを列に入れる。新しいページで、その日の受付が上限に達していれば`false`。 */
    readonly add: (page: string) => Effect.Effect<boolean, QueueUnavailable>
    /** ページの状況。リクエストされたことが無ければ`None`。 */
    readonly status: (page: string) => Effect.Effect<Option.Option<RequestStatus>, QueueUnavailable>
    /** リクエストの多い順、同数なら古い順に取り出し、「翻訳中」にする。 */
    readonly takeNext: (limit: number) => Effect.Effect<ReadonlyArray<string>, QueueUnavailable>
    /** 訳し終えたページの行き先を書く。 */
    readonly finish: (page: string, outcome: Outcome) => Effect.Effect<void, QueueUnavailable>
    /** デプロイが済んだので、公開待ちのページを公開済みにする。 */
    readonly markPublished: Effect.Effect<void, QueueUnavailable>
    readonly countQueued: Effect.Effect<number, QueueUnavailable>
    /** 翻訳モデルのその日の呼び出し回数を1つ増やす。増やした後の回数が`limit`以下なら`true`。 */
    readonly reserveCall: (model: string, limit: number) => Effect.Effect<boolean, QueueUnavailable>
  }
>()("ja-dev-docs/RequestQueue") {}

/** 保存してある訳文1つ。 */
export interface StoredTranslation {
  /** ページの場所。 */
  readonly page: string
  readonly markdown: string
  /** 記録のJSON。 */
  readonly record: string
}

/** 訳文と用語集の置き場所。 */
export class TranslationStore extends Context.Service<
  TranslationStore,
  {
    /** 訳文と記録を書く。`path`は置き場所からの相対パスで、拡張子は付けない。 */
    readonly write: (path: string, markdown: string, record: string) => Effect.Effect<void, StoreFailed>
    /** 保存してある訳文をすべて読む。 */
    readonly list: Effect.Effect<ReadonlyArray<StoredTranslation>, StoreFailed>
    /** 用語集のYAML。 */
    readonly glossary: Effect.Effect<string, StoreFailed>
  }
>()("ja-dev-docs/TranslationStore") {}

/** 書いた訳文を、リポジトリにコミットしてpushする。 */
export class Publisher extends Context.Service<
  Publisher,
  {
    /** 変更が無ければ何もしない。 */
    readonly publish: Effect.Effect<void, PublishFailed>
  }
>()("ja-dev-docs/Publisher") {}

/** 翻訳のジョブの結果を、後続のジョブに伝える。 */
export class JobOutput extends Context.Service<
  JobOutput,
  {
    readonly set: (name: string, value: string) => Effect.Effect<void>
  }
>()("ja-dev-docs/JobOutput") {}

/** リクエストがbotでないことの判定(Turnstile)。 */
export class BotCheck extends Context.Service<
  BotCheck,
  {
    readonly verify: (token: string, ip: string) => Effect.Effect<boolean, BotCheckNotConfigured>
  }
>()("ja-dev-docs/BotCheck") {}

/** 同じ相手からのリクエストの回数の制限。 */
export class RateLimiter extends Context.Service<
  RateLimiter,
  {
    readonly allow: (key: string) => Effect.Effect<boolean>
  }
>()("ja-dev-docs/RateLimiter") {}

/** 公開済みの(静的ファイルとして配信している)ページ。 */
export class PublishedPages extends Context.Service<
  PublishedPages,
  {
    readonly has: (page: string) => Effect.Effect<boolean>
  }
>()("ja-dev-docs/PublishedPages") {}

/** 翻訳のワークフローの起動。実行中なら、終わるのを待ってから次の実行が始まる。 */
export class WorkflowDispatcher extends Context.Service<
  WorkflowDispatcher,
  {
    readonly dispatch: Effect.Effect<void>
  }
>()("ja-dev-docs/WorkflowDispatcher") {}
