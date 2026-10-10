import { seidrRolldownPlugin } from "@fimbul-works/seidr-build-tools/rolldown";
import { defineConfig } from "tsdown";
import { commonConfig } from "../../tsdown.common.js";

export default defineConfig([
  {
    entry: {
      "ui.ssr": "src/index.ts",
    },
    ...commonConfig,
    plugins: [seidrRolldownPlugin({ disableSSR: false, target: "browser" })],
  },
  {
    entry: {
      "ui.core": "src/index.ts",
    },
    ...commonConfig,
    plugins: [seidrRolldownPlugin({ disableSSR: true, target: "browser" })],
  },
]);
