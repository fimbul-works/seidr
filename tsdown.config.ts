import replace from "@rollup/plugin-replace";
import type { InputOptions } from "rolldown";
import { type DepsConfig, defineConfig } from "tsdown";
import { clientNoSSRReplace, clientReplace, treeshake } from "./build.shared.ts";
import { convertDevFlag, removeRegionComments, stringReplace } from "./src/build-plugins/index.ts";

const deps: DepsConfig = {
  alwaysBundle: ["@fimbul-works/futhark"],
};

const inputOptions: InputOptions = {
  optimization: {
    inlineConst: false,
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
    treeshake,
    outDir: "bundles",
    plugins: [
      removeRegionComments(),
      replace({
        ...clientReplace,
        "import.meta.env.SSR": "false",
        preventAssignment: true,
      }),
      convertDevFlag(),
      stringReplace({
        'typeof process === "undefined"': "true",
        'typeof window !== "undefined"': "true",
      }),
    ],
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
    treeshake,
    outDir: "bundles",
    plugins: [
      removeRegionComments(),
      replace({
        ...clientNoSSRReplace,
        preventAssignment: true,
      }),
      convertDevFlag(),
      stringReplace({
        'typeof process === "undefined"': "true",
        'typeof window !== "undefined"': "true",
      }),
    ],
    deps,
    inputOptions,
  },
]);
