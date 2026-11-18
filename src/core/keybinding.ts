/**
 * VS Codeの`kb(コマンド)`を、既定のキー割り当てに変える表。
 *
 * 原文のリポジトリの`build/keybindings`にある、OSごとのキー割り当てのJSONから作る。
 */
import { Option, Schema } from "effect"
import type { Keybinding } from "./segment.ts"

const Bindings = Schema.fromJsonString(Schema.Array(Schema.Struct({ key: Schema.String, command: Schema.String })))
const decodeBindings = Schema.decodeUnknownOption(Bindings)

const MODIFIERS = ["ctrl", "alt", "shift", "cmd"] as const
const MAC_SYMBOLS: Readonly<Record<(typeof MODIFIERS)[number], string>> = { ctrl: "⌃", alt: "⌥", shift: "⇧", cmd: "⌘" }

const capitalize = (word: string): string => word.charAt(0).toUpperCase() + word.slice(1)

const formatChord = (chord: string, mac: boolean): string => {
  const parts = chord.split("+")
  const key = parts.pop() ?? ""
  const name = key.length === 1 ? key.toUpperCase() : capitalize(key)
  if (!mac) {
    return [...parts.map((part) => capitalize(part)), name].join("+")
  }
  return (
    MODIFIERS.filter((modifier) => parts.includes(modifier))
      .map((modifier) => MAC_SYMBOLS[modifier])
      .join("") + name
  )
}

/** `ctrl+shift+p`の形のキー割り当てを、読者に見せる形にする。macOSは記号で書く。 */
export const formatKeys = (binding: string, mac: boolean): string =>
  binding
    .split(" ")
    .map((chord) => formatChord(chord, mac))
    .join(" ")

// コマンドごとに、最初に出てきた割り当てを使う。読めないJSONは、割り当てが無いものとして扱う。
const firstBindings = (json: string | undefined): ReadonlyMap<string, string> => {
  const bindings = json === undefined ? [] : Option.getOrElse(decodeBindings(json), () => [])
  const byCommand = new Map<string, string>()
  for (const { key, command } of bindings) {
    if (!byCommand.has(command)) {
      byCommand.set(command, key)
    }
  }
  return byCommand
}

/** WindowsとmacOSのキー割り当てのJSONから、コマンドを割り当てに変える関数を作る。 */
export const keybindingTable = (win: string | undefined, mac: string | undefined): ((command: string) => Keybinding | undefined) => {
  const winBindings = firstBindings(win)
  const macBindings = firstBindings(mac)
  return (command) => {
    const winKey = winBindings.get(command) ?? macBindings.get(command)
    const macKey = macBindings.get(command) ?? winBindings.get(command)
    return winKey === undefined || macKey === undefined ? undefined : { win: formatKeys(winKey, false), mac: formatKeys(macKey, true) }
  }
}

/** キー割り当てのJSONの、原文のリポジトリでのパス。 */
export const keybindingFile = (os: "win" | "osx"): string => `build/keybindings/doc.keybindings.${os}.json`
