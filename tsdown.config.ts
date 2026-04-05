import replace from "@rollup/plugin-replace";
import type { ModuleFormat } from "rolldown";
import { defineConfig } from "tsdown";
import { clientNoSSRReplace, clientReplace, nodeReplace, treeshake } from "./build.shared.ts";
import { removeRegionComments } from "./scripts/remove-region-comments.ts";

const format: ModuleFormat[] = ["esm"];
const dts = true;
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
        "process.env.DISABLE_SSR": "false",
        preventAssignment: true,
      }),
    ],
    deps: { neverBundle: ["vitest", "node:async_hooks"] },
  },
]);
