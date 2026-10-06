import { defineConfig } from "tsdown";
import { commonConfig } from "../../tsdown.common.js";
import { seidrRolldownPlugin } from "@fimbul-works/seidr-build-tools/rolldown";

export default defineConfig([
  {
    entry: {
      "seidr-router.ssr": "src/index.ts",
    },
    ...commonConfig,
    plugins: [seidrRolldownPlugin({ disableSSR: false, target: "browser" })],
  },
  {
    entry: {
      "seidr-router.core": "src/index.ts",
    },
    ...commonConfig,
    plugins: [seidrRolldownPlugin({ disableSSR: true, target: "browser" })],
  },
]);
