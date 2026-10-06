import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    conditions: ["browser", "node"],
    alias: {
      "@fimbul-works/seidr/html": resolve(import.meta.dirname, "./src/elements/index.ts"),
      "@fimbul-works/seidr": resolve(import.meta.dirname, "./src/index.ts"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test-setup/setup.ts"],
    exclude: ["**/node_modules/**", "**/dist/**", "**/*.parity.test.ts", "**/dual-mode-*.test.ts"],
  },
});
