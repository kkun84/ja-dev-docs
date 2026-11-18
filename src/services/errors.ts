import { Cause, Option, Schema } from "effect"

/** 原文のリポジトリを読めなかった。ファイルが無い(404)ことは、エラーではなく`None`で表す。 */
export class SourceUnavailable extends Schema.TaggedError<SourceUnavailable, { readonly brand: unique symbol }>()("SourceUnavailable", {
  url: Schema.String,
  detail: Schema.String
}) {}

/** 原文のリポジトリに、ページに対応するファイルが無い。 */
export class SourceNotFound extends Schema.TaggedError<SourceNotFound, { readonly brand: unique symbol }>()("SourceNotFound", {
  page: Schema.String
}) {}

/** 翻訳モデルの、その日に呼んでよい回数を使い切った。 */
export class QuotaExceeded extends Schema.TaggedError<QuotaExceeded, { readonly brand: unique symbol }>()("QuotaExceeded", {
  spec: Schema.String,
  detail: Schema.String
}) {}

/** 翻訳モデルが要求を拒んだか、応答を返さなかった。`status`はHTTPの状態コードで、応答が無ければ`undefined`。 */
export class ModelRequestFailed extends Schema.TaggedError<ModelRequestFailed, { readonly brand: unique symbol }>()("ModelRequestFailed", {
  spec: Schema.String,
  status: Schema.UndefinedOr(Schema.Finite),
  detail: Schema.String
}) {}

/** 順番待ちの列(D1)を読み書きできなかった。 */
export class QueueUnavailable extends Schema.TaggedError<QueueUnavailable, { readonly brand: unique symbol }>()("QueueUnavailable", {
  detail: Schema.String
}) {}

/** 訳文や用語集を、読み書きできなかったか、読んだ中身が決まった形でなかった。 */
export class StoreFailed extends Schema.TaggedError<StoreFailed, { readonly brand: unique symbol }>()("StoreFailed", {
  path: Schema.String,
  detail: Schema.String
}) {}

/** 訳文をコミットしてpushできなかった。 */
export class PublishFailed extends Schema.TaggedError<PublishFailed, { readonly brand: unique symbol }>()("PublishFailed", {
  detail: Schema.String
}) {}

/**
 * 訳せなかった断片が多く、ページを公開できない。
 *
 * `retry`は、APIの障害や上限が原因で、時間をおけば訳せる見込みがあること。
 */
export class PageNotPublishable extends Schema.TaggedError<PageNotPublishable, { readonly brand: unique symbol }>()("PageNotPublishable", {
  reason: Schema.String,
  retry: Schema.Boolean
}) {}

/** bot判定の秘密鍵が登録されておらず、リクエストを受け付けられない。 */
export class BotCheckNotConfigured extends Schema.TaggedError<BotCheckNotConfigured, { readonly brand: unique symbol }>()(
  "BotCheckNotConfigured",
  {}
) {}

/** 1ページの翻訳が型付きで失敗する理由。 */
export type TranslatePageError = SourceUnavailable | SourceNotFound | StoreFailed | PageNotPublishable

const hasTag = (error: unknown): error is { readonly _tag: string } =>
  typeof error === "object" && error !== null && "_tag" in error && typeof error._tag === "string"

/**
 * 失敗の理由を、ログに出す1つの文字列にする。
 *
 * 型付きのエラーは、種類と中身を出す。想定外の欠陥は、スタックトレースを含めて出す。
 */
export const describeCause = (cause: Cause.Cause<unknown>): string =>
  Option.match(Cause.findErrorOption(cause), {
    onNone: () => Cause.pretty(cause),
    onSome: (error) => (hasTag(error) ? `${error._tag}: ${JSON.stringify(error)}` : Cause.pretty(cause))
  })
