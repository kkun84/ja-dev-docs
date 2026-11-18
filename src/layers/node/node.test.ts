import { execFileSync } from "node:child_process"
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"
import { PublishFailed, StoreFailed } from "../../services/errors.ts"
import { JobOutput, Publisher, TranslationStore } from "../../services/ports.ts"
import { githubOutputLayer } from "./job-output.ts"
import { runCommand } from "./process.ts"
import { gitPublisherLayer } from "./publisher.ts"
import { translationStoreLayer } from "./translation-store.ts"
import { inlineParams, sqlLiteral } from "./wrangler-d1.ts"

let root = ""

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "ja-dev-docs-"))
})

afterEach(() => {
  rmSync(root, { recursive: true, force: true })
})

describe("translationStoreLayer", () => {
  const layer = () => translationStoreLayer({ directory: join(root, "content"), glossary: join(root, "glossary.yml") })

  it.effect("訳文と記録を書き、ページの場所と組にして読む", () =>
    Effect.gen(function* () {
      const store = yield* TranslationStore
      yield* store.write("docs.github.com/en/b/model", "本文B\n", "{}\n")
      yield* store.write("code.visualstudio.com/docs/a/model", "本文A\n", '{"a":1}\n')

      expect(readFileSync(join(root, "content/docs.github.com/en/b/model.md"), "utf8")).toBe("本文B\n")
      expect(yield* store.list).toStrictEqual([
        { page: "code.visualstudio.com/docs/a", markdown: "本文A\n", record: '{"a":1}\n' },
        { page: "docs.github.com/en/b", markdown: "本文B\n", record: "{}\n" }
      ])
    }).pipe(Effect.provide(layer()))
  )

  it.effect("訳文がまだ1つも無ければ、空を返す", () =>
    Effect.gen(function* () {
      expect(yield* (yield* TranslationStore).list).toStrictEqual([])
    }).pipe(Effect.provide(layer()))
  )

  it.effect("記録に対応する訳文が無ければStoreFailedで失敗する", () =>
    Effect.gen(function* () {
      mkdirSync(join(root, "content/a"), { recursive: true })
      writeFileSync(join(root, "content/a/model.json"), "{}")

      expect(yield* Effect.flip((yield* TranslationStore).list)).toBeInstanceOf(StoreFailed)
    }).pipe(Effect.provide(layer()))
  )

  it.effect("用語集を読む。無ければStoreFailedで失敗する", () =>
    Effect.gen(function* () {
      const store = yield* TranslationStore

      expect(yield* Effect.flip(store.glossary)).toBeInstanceOf(StoreFailed)

      writeFileSync(join(root, "glossary.yml"), "docs.github.com: {}\n")

      expect(yield* store.glossary).toBe("docs.github.com: {}\n")
    }).pipe(Effect.provide(layer()))
  )
})

describe("githubOutputLayer", () => {
  it.effect("名前と値を、ファイルに1行ずつ足す", () =>
    Effect.gen(function* () {
      const output = yield* JobOutput
      yield* output.set("publish", "true")
      yield* output.set("more", "false")

      expect(readFileSync(join(root, "output"), "utf8")).toBe("publish=true\nmore=false\n")
    }).pipe(Effect.provide(githubOutputLayer(join(root, "output"))))
  )

  it.effect("ファイルが渡されなければ、書かずに続ける", () =>
    Effect.gen(function* () {
      yield* (yield* JobOutput).set("publish", "true")
    }).pipe(Effect.provide(githubOutputLayer()))
  )
})

describe("runCommand", () => {
  it.effect("標準出力を返す。引数はシェルを通さない", () =>
    Effect.gen(function* () {
      expect(yield* runCommand("node", ["-e", "process.stdout.write(process.argv[1])", "$(echo x); `y`"])).toBe("$(echo x); `y`")
    })
  )

  it.effect("終了コードが0でなければ、標準エラー出力を付けて失敗する", () =>
    Effect.gen(function* () {
      const failure = yield* Effect.flip(runCommand("node", ["-e", "process.stderr.write('boom'); process.exit(2)"]))

      expect(failure).toStrictEqual({ command: "node -e", detail: "boom" })
    })
  )
})

describe("gitPublisherLayer", () => {
  const git = (cwd: string, ...args: ReadonlyArray<string>): string =>
    execFileSync("git", [...args], { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] })
  let previous = ""

  // pushする先の空のリポジトリと、その複製を作り、複製の中で動かす。
  beforeEach(() => {
    const remote = join(root, "remote.git")
    const work = join(root, "work")
    git(root, "init", "--quiet", "--bare", "--initial-branch=main", remote)
    git(root, "clone", "--quiet", remote, work)
    git(work, "config", "user.name", "test")
    git(work, "config", "user.email", "test@example.com")
    writeFileSync(join(work, "README.md"), "x\n")
    git(work, "add", ".")
    git(work, "commit", "--quiet", "-m", "first")
    git(work, "push", "--quiet", "origin", "HEAD:main")
    previous = process.cwd()
    process.chdir(work)
  })

  afterEach(() => {
    process.chdir(previous)
  })

  const layer = gitPublisherLayer({ directory: "content", branch: "main", message: "訳文を追加" })
  const publish = Publisher.use((publisher) => publisher.publish).pipe(Effect.provide(layer))

  it.effect("訳文のディレクトリの変更だけをコミットして、pushする", () =>
    Effect.gen(function* () {
      mkdirSync("content")
      writeFileSync("content/a.md", "訳\n")
      writeFileSync("other.txt", "not committed\n")
      yield* publish

      expect(git(join(root, "remote.git"), "log", "--format=%s", "main").trim().split("\n")).toStrictEqual(["訳文を追加", "first"])
      expect(git(join(root, "remote.git"), "show", "--name-only", "--format=", "main").trim()).toBe("content/a.md")
    })
  )

  it.effect("変更が無ければ、コミットもpushもしない", () =>
    Effect.gen(function* () {
      mkdirSync("content")
      yield* publish

      expect(git(join(root, "remote.git"), "log", "--format=%s", "main").trim()).toBe("first")
    })
  )

  it.effect("ほかの実行が先にpushしていても、取り込んでからpushする", () =>
    Effect.gen(function* () {
      const other = join(root, "other")
      git(root, "clone", "--quiet", join(root, "remote.git"), other)
      git(other, "config", "user.name", "test")
      git(other, "config", "user.email", "test@example.com")
      writeFileSync(join(other, "b.md"), "b\n")
      git(other, "add", ".")
      git(other, "commit", "--quiet", "-m", "other run")
      git(other, "push", "--quiet", "origin", "HEAD:main")
      mkdirSync("content")
      writeFileSync("content/a.md", "訳\n")
      yield* publish

      expect(git(join(root, "remote.git"), "log", "--format=%s", "main").trim().split("\n")).toStrictEqual([
        "訳文を追加",
        "other run",
        "first"
      ])
    })
  )

  it.effect("pushできなければPublishFailedで失敗する", () =>
    Effect.gen(function* () {
      git(process.cwd(), "remote", "set-url", "origin", join(root, "missing.git"))
      mkdirSync("content")
      writeFileSync("content/a.md", "訳\n")

      expect(yield* Effect.flip(publish)).toBeInstanceOf(PublishFailed)
    })
  )
})

describe("wranglerで実行するSQL", () => {
  it("値をSQLのリテラルにするとき、引用符をエスケープする", () => {
    expect(sqlLiteral("a'b")).toBe("'a''b'")
    expect(sqlLiteral(3)).toBe("3")
    expect(sqlLiteral(null)).toBe("NULL")
    expect(sqlLiteral(Number.NaN)).toBe("'NaN'")
  })

  it("番号の付いた場所に、値のリテラルを埋め込む", () => {
    expect(inlineParams("UPDATE t SET a = ?2, b = ?2 WHERE page = ?1 AND c = ?3", ["x'; DROP TABLE t; --", 5])).toBe(
      "UPDATE t SET a = 5, b = 5 WHERE page = 'x''; DROP TABLE t; --' AND c = NULL"
    )
  })
})
