import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test-setup/index.ts"],
    exclude: ["**/node_modules/**", "**/dist/**", "**/*.parity.test.ts", "**/dual-mode-*.test.ts"],
  },
});
