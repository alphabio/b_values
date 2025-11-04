// b_path:: vitest.config.ts
/// <reference types="vitest" />

import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "node",
    include: [
      "packages/*/src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
      "packages/*/test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
    ],
    exclude: ["node_modules", "dist", ".idea", ".git", ".cache", "TMP"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "coverage/**",
        "dist/**",
        "TMP/**",
        "TMP/**/*.*",
        "NOTES/**",
        "benchmark/**",
        "scripts/**",
        "examples/**",
        "docs/**",
        "docs.internal/**",
        "docs.llm/**",
        "packages/*/test{,s}/**",
        "**/*.d.ts",
        "cypress/**",
        "test{,s}/**",
        "test{,-*}.{js,cjs,mjs,ts,tsx,jsx}",
        "**/*{.,-}test.{js,cjs,mjs,ts,tsx,jsx}",
        "**/*{.,-}spec.{js,cjs,mjs,ts,tsx,jsx}",
        "**/__test__/**",
        "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*",
        "**/.{eslint,mocha,prettier}rc.{js,cjs,yml}",
        // Index files (barrel exports only)
        "**/index.ts",
        // Core infrastructure (tested via usage)
        "src/core/result.ts", // Result type utilities
        "src/core/units/**", // Simple type exports
      ],
      thresholds: {
        lines: 89,
        functions: 90,
        branches: 71,
        statements: 89,
      },
    },
  },
  esbuild: {
    target: "node18",
  },
});
