import { type UserConfig, defineConfig } from "tsdown";
import { seidrRolldownPlugin } from "./src/build-plugins/index.ts";

// Target option for seidrRolldownPlugin
const target = "browser";

// Common build configuration for all entry points
const common: UserConfig = {
  platform: "browser",
  format: ["esm"],
  target: "es2022",
  dts: false,
  treeshake: true,
  outDir: "bundles",
  deps: {
    alwaysBundle: ["@fimbul-works/futhark", "@fimbul-works/hash"],
  },
  inputOptions: {
    optimization: {
      inlineConst: false,
    },
    experimental: {
      attachDebugInfo: "none",
    },
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
};

export default defineConfig([
  // Client-side bundle with SSR hydration
  {
    entry: {
      seidr: "src/index.ts",
    },
    ...common,
    plugins: [seidrRolldownPlugin({ disableSSR: false, target })],
  },
  // Full client-side bundle with SSR hydration
  {
    entry: {
      "seidr.full": "src/index.full.ts",
    },
    ...common,
    plugins: [seidrRolldownPlugin({ disableSSR: false, target })],
  },
  // Core bundle (no SSR)
  {
    entry: {
      "seidr.core": "src/index.core.ts",
    },
    ...common,
    plugins: [seidrRolldownPlugin({ disableSSR: true, target })],
  },
]);
