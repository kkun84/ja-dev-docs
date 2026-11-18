import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    // pipelineとsrc/libは作り直す前のコードのテスト。作り直しが済んだ層から順に消す。
    include: ["src/**/*.test.ts", "scripts/**/*.test.ts", "pipeline/**/*.test.ts"],
    environment: "node",
    // includeがtypoなどで1件も拾えていないときに、黙って成功させない。
    passWithNoTests: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      reportsDirectory: "coverage",
      include: ["src/**/*.ts"],
      // src/libは作り直す前のコード。Astroの中でだけ動く部分があり、数えない。
      // src/layers/testはテストの道具なので数えない。
      exclude: ["src/**/*.test.ts", "src/lib/**", "src/content.config.ts", "src/layers/test/**"],
      thresholds: {
        "src/core/**": {
          lines: 90,
          branches: 90,
          functions: 90,
          statements: 90
        },
        "src/services/**": {
          lines: 90,
          branches: 90,
          functions: 90,
          statements: 90
        }
      }
    }
  }
})
