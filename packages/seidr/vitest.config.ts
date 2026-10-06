import { resolve } from "node:path";
import { seidrConfig } from "@repo/vitest-config/seidr";
import { defineConfig, mergeConfig } from "vitest/config";

export default mergeConfig(
  seidrConfig,
  defineConfig({
    resolve: {
      conditions: ["browser", "node"],
      alias: {
        "@fimbul-works/seidr/html": resolve(import.meta.dirname, "./src/elements/index.ts"),
        "@fimbul-works/seidr/ssr": resolve(import.meta.dirname, "./src/index.ssr.ts"),
        "@fimbul-works/seidr": resolve(import.meta.dirname, "./src/index.ts"),
      },
    },
    test: {
      setupFiles: ["./src/test-setup/setup.ts"],
    },
  }),
);
