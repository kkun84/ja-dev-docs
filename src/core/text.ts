/**
 * 正規表現の結果から、番号で指定したグループの文字列を取り出す。
 *
 * 一致しなかったときと、そのグループが一致に加わらなかったときは、空文字を返す。
 */
export const capture = (match: RegExpMatchArray | null | undefined, index: number): string => match?.[index] ?? ""
