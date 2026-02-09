import { makeClientBundle, makeNodeBundle } from "./rollup.shared.js";

export default [
  makeNodeBundle("src/index.node.ts", "dist/seidr.node", true, { "process.env.CORE_DISABLE_SSR": "false" }),
  makeClientBundle("src/index.browser.ts", "dist/seidr", true, { "process.env.CORE_DISABLE_SSR": "false" }),
  makeClientBundle("src/index.core.ts", "dist/seidr.core", false, { "process.env.CORE_DISABLE_SSR": "true" }),
];
