import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";

const browserReplace = {
  preventAssignment: true,
  // Production build
  "process.env.NODE_ENV": '"production"',
  // Always false in browser builds
  "process.env.SEIDR_TEST_SSR": "false",
  // Strip away SSR
  "process.env.CLIENT_BUNDLE": "true",
  // Disable SSR code
  process: "undefined",
  window: "true",
};

const nodeReplace = {
  preventAssignment: true,
  // Production build
  "process.env.NODE_ENV": '"production"',
  // Disable client bundle guards
  "process.env.CLIENT_BUNDLE": "false",
  "process.env.CORE_BUNDLE": "false",
  window: "undefined",
};

const pluginsCommon = [typescript({ tsconfig: "./tsconfig.json", declaration: false }), resolve(), commonjs()];
const pluginsNode = [...pluginsCommon, replace(nodeReplace)];
const pluginsFull = [...pluginsCommon, replace({ ...browserReplace, "process.env.CORE_BUNDLE": "false" })];
const pluginsCore = [...pluginsCommon, replace({ ...browserReplace, "process.env.CORE_BUNDLE": "true" })];

const terserPlugin = terser({
  module: false,
  mangle: {
    module: true,
    properties: false,
    // Preserve class names for instanceof checks
    reserved: ["Seidr"],
  },
  compress: {
    passes: 2,
  },
});

const treeshake = {
  moduleSideEffects: false,
  propertyReadSideEffects: false,
  unknownGlobalSideEffects: false,
};

export default [
  // Node/SSR Builds
  {
    input: "src/index.node.ts",
    output: [
      { file: "dist/seidr.node.js", format: "esm" },
      { file: "dist/seidr.node.cjs", format: "cjs" },
    ],
    // Mark Node built-ins as external so they aren't bundled
    external: ["node:async_hooks"],
    plugins: pluginsNode,
    treeshake,
  },
  // Browser Builds: Full
  {
    input: "src/index.browser.ts",
    output: [
      { file: "dist/seidr.js", format: "esm" },
      { file: "dist/seidr.cjs", format: "cjs" },
    ],
    plugins: pluginsFull,
    treeshake,
  },
  // Browser Builds: Full (min)
  {
    input: "src/index.browser.ts",
    output: [
      { file: "dist/seidr.min.js", format: "esm", compact: true, sourcemap: true },
      { file: "dist/seidr.min.cjs", format: "cjs", compact: true, sourcemap: true },
    ],
    plugins: [...pluginsFull, terserPlugin],
    treeshake,
  },
  // Browser Builds: Core
  {
    input: "src/index.browser.core.ts",
    output: [
      { file: "dist/seidr.core.js", format: "esm" },
      { file: "dist/seidr.core.cjs", format: "cjs" },
    ],
    plugins: pluginsCore,
    treeshake,
  },
  // Browser Builds: Core (min)
  {
    input: "src/index.browser.core.ts",
    output: [
      { file: "dist/seidr.core.min.js", format: "esm", compact: true, sourcemap: true },
      { file: "dist/seidr.core.min.cjs", format: "cjs", compact: true, sourcemap: true },
    ],
    plugins: [...pluginsCore, terserPlugin],
    treeshake,
  },
];
