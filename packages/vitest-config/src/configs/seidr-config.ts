import { defineProject, mergeConfig } from "vitest/config";
import { baseConfig } from "./base-config.js";

export const seidrConfig = mergeConfig(
  baseConfig,
  defineProject({
    server: {
      fs: {
        allow: ["..", "../.."],
      },
    },
    test: {
      environment: "jsdom",
      globals: true,
      exclude: ["**/node_modules/**", "**/dist/**", "**/bundles/**"],
    },
  }),
);
