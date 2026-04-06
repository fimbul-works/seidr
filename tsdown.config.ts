import replace from "@rollup/plugin-replace";
import { defineConfig } from "tsdown";
import { clientNoSSRReplace, treeshake } from "./build.shared.ts";
import { convertDevFlag } from "./scripts/convert-dev-flag.ts";
import { removeRegionComments } from "./scripts/remove-region-comments.ts";

export default defineConfig([
  // Core bundle (no SSR)
  {
    entry: {
      "seidr.core": "src/index.core.ts",
    },
    platform: "browser",
    format: ["esm", "cjs"],
    target: "es2022",
    dts: true,
    treeshake,
    outDir: "bundles",
    plugins: [
      removeRegionComments(),
      replace({
        ...clientNoSSRReplace,
        preventAssignment: true,
      }),
      convertDevFlag(),
    ],
  },
]);
