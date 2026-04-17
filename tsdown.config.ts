import replace from "@rollup/plugin-replace";
import { defineConfig } from "tsdown";
import { clientNoSSRReplace, clientReplace, treeshake } from "./build.shared.ts";
import { convertDevFlag, removeRegionComments } from "./src/build-plugins/index.ts";

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
    treeshake,
    outDir: "bundles",
    plugins: [
      removeRegionComments(),
      replace({
        ...clientReplace,
        "import.meta.env?.SSR": false,
        "import.meta.env.SSR": false,
        preventAssignment: true,
      }),
      convertDevFlag(),
    ],
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
