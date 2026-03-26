import { makeClientBundle, makeNodeBundle, makeTestBundle } from "./rollup.shared.js";

export default [
  makeTestBundle("src/test-setup/index.ts", "dist/testing", false, { "process.env.CORE_DISABLE_SSR": "false" }),
  makeNodeBundle("src/index.server.ts", "dist/seidr.server", false, { "process.env.CORE_DISABLE_SSR": "false" }),
  makeClientBundle("src/index.client.ts", "dist/seidr", false, { "process.env.CORE_DISABLE_SSR": "false" }),
  makeClientBundle("src/index.core.ts", "dist/seidr.core", false, {
    "process.env.CORE_DISABLE_SSR": "true",
    "import.meta.env.SSR": "false",
    "isHydrating()": "false",
  }),
];
