import { makeBrowserBundle, makeNodeBundle } from "./rollup.shared.js";

export default [
  makeNodeBundle("src/index.node.ts", "dist/seidr.node"),
  makeBrowserBundle("src/index.browser.ts", "dist/seidr"),
];
