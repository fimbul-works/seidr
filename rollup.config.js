import { makeBrowserBundle, makeNodeBundle } from "./rollup.shared.js";

export default [
  makeNodeBundle("src/index.node.ts", "dist/seidr.node", { "process.env.NO_SSR": "'false'" }),
  makeBrowserBundle("src/index.browser.ts", "dist/seidr", { "process.env.NO_SSR": "'false'" }),
  makeBrowserBundle("src/index.browser.ts", "dist/seidr.no-ssr", { "process.env.NO_SSR": "'true'" }),
];
