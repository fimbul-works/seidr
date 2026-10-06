import { type UserConfig } from "tsdown";

export const commonConfig: UserConfig = {
  platform: "browser",
  format: ["esm"],
  target: "es2022",
  dts: false,
  treeshake: true,
  sourcemap: false,
  outDir: "bundles",
  inputOptions: {
    experimental: {
      attachDebugInfo: "none",
    },
    optimization: {
      inlineConst: false,
    },
  },
  deps: {
    alwaysBundle: ["@fimbul-works/futhark", "@fimbul-works/hash"],
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
};
