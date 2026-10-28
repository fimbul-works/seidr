import { seidrRolldownPlugin } from "@fimbul-works/seidr-build-tools/rolldown";
import { defineConfig } from "tsdown";
import { commonConfig } from "../../tsdown.common.js";

// Target option for seidrRolldownPlugin
const target = "browser";

const deps = {
  alwaysBundle: ["@fimbul-works/futhark", "@fimbul-works/hash", "@fimbul-works/hvat"],
};

export default defineConfig([
  // Client-side bundle with SSR hydration
  {
    entry: {
      seidr: "src/index.ts",
    },
    ...commonConfig,
    deps,
    plugins: [seidrRolldownPlugin({ disableSSR: false, target })],
  },
  // Full client-side bundle with SSR hydration
  {
    entry: {
      "seidr.full": "src/index.full.ts",
    },
    ...commonConfig,
    deps,
    plugins: [seidrRolldownPlugin({ disableSSR: false, target })],
  },
  // Core bundle (no SSR)
  {
    entry: {
      "seidr.core": "src/index.core.ts",
    },
    ...commonConfig,
    deps,
    plugins: [seidrRolldownPlugin({ disableSSR: true, target })],
  },
]);
