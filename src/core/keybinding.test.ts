import { describe, expect, it } from "vitest"
import { formatKeys, keybindingFile, keybindingTable } from "./keybinding.ts"

const win = JSON.stringify([
  { key: "ctrl+shift+p", command: "workbench.action.showCommands" },
  { key: "f1", command: "workbench.action.showCommands" },
  { key: "ctrl+k ctrl+s", command: "workbench.action.openGlobalKeybindings" },
  { key: "alt+up", command: "onlyWindows" }
])
const mac = JSON.stringify([
  { key: "shift+cmd+p", command: "workbench.action.showCommands" },
  { key: "cmd+k cmd+s", command: "workbench.action.openGlobalKeybindings" },
  { key: "ctrl+alt+enter", command: "onlyMac" }
])

describe("formatKeys", () => {
  it("Windowsは名前を+でつなぎ、macOSは記号を決まった順に並べる", () => {
    expect(formatKeys("ctrl+shift+p", false)).toBe("Ctrl+Shift+P")
    expect(formatKeys("shift+cmd+p", true)).toBe("⇧⌘P")
    expect(formatKeys("ctrl+k ctrl+s", false)).toBe("Ctrl+K Ctrl+S")
    expect(formatKeys("ctrl+alt+enter", true)).toBe("⌃⌥Enter")
  })
})

describe("keybindingTable", () => {
  const table = keybindingTable(win, mac)

  it("コマンドごとに、最初に出てきた割り当てを使う", () => {
    expect(table("workbench.action.showCommands")).toStrictEqual({ win: "Ctrl+Shift+P", mac: "⇧⌘P" })
    expect(table("workbench.action.openGlobalKeybindings")).toStrictEqual({ win: "Ctrl+K Ctrl+S", mac: "⌘K ⌘S" })
  })

  it("片方のOSにしか無い割り当ては、もう片方にも使う", () => {
    expect(table("onlyWindows")).toStrictEqual({ win: "Alt+Up", mac: "⌥Up" })
    expect(table("onlyMac")).toStrictEqual({ win: "Ctrl+Alt+Enter", mac: "⌃⌥Enter" })
  })

  it("割り当ての無いコマンドと、読めないJSONは、割り当て無しにする", () => {
    expect(table("unknown")).toBeUndefined()
    expect(keybindingTable("not json", new Map<string, string>().get("missing"))("workbench.action.showCommands")).toBeUndefined()
  })
})

describe("keybindingFile", () => {
  it("原文のリポジトリでのパスを返す", () => {
    expect(keybindingFile("osx")).toBe("build/keybindings/doc.keybindings.osx.json")
  })
})
