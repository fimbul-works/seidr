import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    conditions: ["browser", "node"],
    alias: {
      "@fimbul-works/seidr/html": resolve(__dirname, "./src/elements/index.ts"),
      "@fimbul-works/seidr/ssr": resolve(__dirname, "./src/index.ssr.ts"),
      "@fimbul-works/seidr": resolve(__dirname, "./src/index.ts"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test-setup/setup.ts"],
    exclude: ["**/node_modules/**", "**/dist/**", "**/*.parity.test.ts", "**/dual-mode-*.test.ts"],
  },
});
