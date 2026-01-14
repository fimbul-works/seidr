import { makeBrowserBundle } from "./rollup.shared.js";

export default [
  makeBrowserBundle("src/bundle.router.ts", "dist/bundle/router", false),
  makeBrowserBundle("src/bundle.animation.ts", "dist/bundle/animation", false),
  makeBrowserBundle("src/bundle.ssr.ts", "dist/bundle/ssr", false),
];
