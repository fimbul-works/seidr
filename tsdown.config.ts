import type { InputOptions } from "rolldown";
import { type DepsConfig, defineConfig } from "tsdown";
import { seidrBundlePlugin } from "./src/build-plugins/bundle-plugin.ts";

const deps: DepsConfig = {
  alwaysBundle: ["@fimbul-works/futhark"],
};

const inputOptions: InputOptions = {
  optimization: {
    inlineConst: false,
  },
  experimental: {
    attachDebugInfo: "none",
  },
};

export default defineConfig([
  // Full client-side bundle with hydration
  {
    entry: {
      seidr: "src/index.ts",
    },
    platform: "browser",
    format: ["esm", "cjs"],
    target: "es2022",
    dts: true,
    treeshake: true,
    outDir: "bundles",
    plugins: [seidrBundlePlugin({ disableSSR: false })],
    deps,
    inputOptions,
  },
  // Core bundle (no SSR)
  {
    entry: {
      "seidr.core": "src/index.core.ts",
    },
    platform: "browser",
    format: ["esm", "cjs"],
    target: "es2022",
    dts: true,
    treeshake: true,
    outDir: "bundles",
    plugins: [seidrBundlePlugin({ disableSSR: true })],
    deps,
    inputOptions,
  },
]);
