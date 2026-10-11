import { seidrConfig } from "@repo/vitest-config/seidr";
import { defineConfig, mergeConfig } from "vitest/config";

export default mergeConfig(
  seidrConfig,
  defineConfig({
    test: {
      setupFiles: ["../seidr/src/test-setup/setup.ts", "./src/test-setup/index.ts"],
      exclude: ["./radix-ui-primitives/**/*.*"],
    },
  }),
);
