import replace from "@rollup/plugin-replace";
import type { ModuleFormat } from "rolldown";
import { defineConfig } from "tsdown";
import { clientNoSSRReplace, mainReplace, treeshake } from "./build.shared.ts";
import { convertDevFlag } from "./scripts/convert-dev-flag.ts";
import { redirectNonSsrImports } from "./scripts/redirect-non-ssr-imports.ts";
import { removeRegionComments } from "./scripts/remove-region-comments.ts";

const format: ModuleFormat[] = ["esm"];
const dts = true;
const sharedPlugins = [removeRegionComments(), convertDevFlag()];
const outDir = "dist";

export default defineConfig([
  // Main bundle
  {
    entry: {
      seidr: "src/index.ts",
    },
    platform: "neutral",
    format,
    target: "es2022",
    dts,
    treeshake,
    outDir,
    plugins: [
      ...sharedPlugins,
      replace({
        ...mainReplace,
        preventAssignment: true,
      }),
    ],
  },
  // SSR bundle
  {
    entry: {
      "seidr.ssr": "src/index.ssr.ts",
    },
    platform: "neutral",
    format,
    target: "es2022",
    dts,
    treeshake,
    outDir,
    plugins: [
      ...sharedPlugins,
      replace({
        ...mainReplace,
        preventAssignment: true,
      }),
      redirectNonSsrImports(),
    ],
    deps: { neverBundle: ["node:async_hooks", /^(?!.*ssr)/], alwaysBundle: [/ssr/] },
  },
  // Core bundle (no SSR)
  {
    entry: {
      "seidr.core": "src/index.ts",
    },
    platform: "browser",
    format,
    target: "es2022",
    dts,
    treeshake,
    outDir,
    plugins: [
      ...sharedPlugins,
      replace({
        ...clientNoSSRReplace,
        preventAssignment: true,
      }),
    ],
  },
  // Testing utilities bundle
  {
    entry: {
      testing: "src/test-setup/index.ts",
    },
    platform: "neutral",
    format: "esm",
    target: false,
    dts,
    treeshake,
    outDir,
    plugins: [
      ...sharedPlugins,
      replace({
        "process.env.VITEST": "true",
        "process.env.DISABLE_SSR": "false",
        preventAssignment: true,
      }),
    ],
    deps: { neverBundle: ["vitest", "node:async_hooks"] },
  },
]);
