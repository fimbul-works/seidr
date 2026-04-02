import replace from "@rollup/plugin-replace";
import type { ModuleFormat, TreeshakingOptions } from "rolldown";
import { defineConfig } from "tsdown";
import { clientNoSSRReplace, clientReplace, nodeReplace } from "./build.shared.ts";
import { removeRegionComments } from "./scripts/remove-region-comments.ts";

const format: ModuleFormat[] = ["esm"];
const dts = true;
const treeshake: TreeshakingOptions = {
  annotations: false,
  commonjs: false,
  moduleSideEffects: false,
  invalidImportSideEffects: false,
  unknownGlobalSideEffects: true,
};
const sharedPlugins = [removeRegionComments()];
const outDir = "dist";

export default defineConfig([
  {
    entry: {
      "seidr.core": "src/index.core.ts",
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
        ...clientReplace,
        ...clientNoSSRReplace,
        preventAssignment: true,
      }),
    ],
  },
  {
    entry: {
      seidr: "src/index.client.ts",
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
        ...clientReplace,
        window: "{}",
        "process.env.CORE_DISABLE_SSR": "false",
        preventAssignment: true,
      }),
    ],
  },
  {
    entry: {
      "seidr.server": "src/index.server.ts",
    },
    platform: "node",
    format,
    target: "node20",
    dts,
    treeshake,
    outDir,
    plugins: [
      ...sharedPlugins,
      replace({
        ...nodeReplace,
        "process.env.CORE_DISABLE_SSR": "false",
        preventAssignment: true,
      }),
    ],
    deps: { neverBundle: ["node:async_hooks"] },
  },
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
        "process.env.CORE_DISABLE_SSR": "false",
        preventAssignment: true,
      }),
    ],
    deps: { neverBundle: ["vitest", "node:async_hooks"] },
  },
]);
