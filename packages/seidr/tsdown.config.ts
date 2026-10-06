import { defineConfig } from "tsdown";
import { seidrRolldownPlugin } from "@fimbul-works/seidr-build-tools/rolldown";
import { commonConfig } from "../../tsdown.common.js";

// Target option for seidrRolldownPlugin
const target = "browser";

export default defineConfig([
  // Client-side bundle with SSR hydration
  {
    entry: {
      seidr: "src/index.ts",
    },
    ...commonConfig,
    plugins: [seidrRolldownPlugin({ disableSSR: false, target })],
  },
  // Full client-side bundle with SSR hydration
  {
    entry: {
      "seidr.full": "src/index.full.ts",
    },
    ...commonConfig,
    plugins: [seidrRolldownPlugin({ disableSSR: false, target })],
  },
  // Core bundle (no SSR)
  {
    entry: {
      "seidr.core": "src/index.core.ts",
    },
    ...commonConfig,
    plugins: [seidrRolldownPlugin({ disableSSR: true, target })],
  },
]);
