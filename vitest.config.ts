import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts", "scripts/**/*.test.ts"],
    environment: "node",
    // includeがtypoなどで1件も拾えていないときに、黙って成功させない。
    passWithNoTests: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      reportsDirectory: "coverage",
      include: ["src/**/*.ts"],
      // 入口は、ビルドしたサイトとWorkerのバンドルで確かめるので数えない。src/layers/testはテストの道具。
      exclude: ["src/**/*.test.ts", "src/entrypoints/**", "src/layers/test/**"],
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
