import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";

const plugins = [typescript({ tsconfig: "./tsconfig.json", declaration: false }), resolve(), commonjs()];

const browserReplace = replace({
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
});

const nodeReplace = replace({
  preventAssignment: true,
  // Production build
  "process.env.NODE_ENV": '"production"',
});

const terserPlugin = terser({
  module: false,
  mangle: {
    module: true,
    properties: true,
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
      { file: "dist/node/seidr.js", format: "esm" },
      { file: "dist/node/seidr.cjs", format: "cjs" },
    ],
    // Mark Node built-ins as external so they aren't bundled
    external: ["node:async_hooks", "node:module"],
    plugins: [...plugins, nodeReplace],
    treeshake,
  },
  // Browser Builds: Full
  {
    input: "src/index.browser.ts",
    output: [
      { file: "dist/browser/seidr.js", format: "esm" },
      { file: "dist/browser/seidr.cjs", format: "cjs" },
    ],
    plugins: [...plugins, browserReplace],
    treeshake,
  },
  // Browser Builds: Full (min)
  {
    input: "src/index.browser.ts",
    output: [
      { file: "dist/browser/seidr.min.js", format: "esm", compact: true, sourcemap: true },
      { file: "dist/browser/seidr.min.cjs", format: "cjs", compact: true, sourcemap: true },
    ],
    plugins: [...plugins, browserReplace, terserPlugin],
    treeshake,
  },
  // Browser Builds: Core
  {
    input: "src/index.browser.core.ts",
    output: [
      { file: "dist/browser/seidr.core.js", format: "esm" },
      { file: "dist/browser/seidr.core.cjs", format: "cjs" },
    ],
    plugins: [...plugins, browserReplace],
    treeshake,
  },
  // Browser Builds: Core (min)
  {
    input: "src/index.browser.core.ts",
    output: [
      { file: "dist/browser/seidr.core.min.js", format: "esm", compact: true, sourcemap: true },
      { file: "dist/browser/seidr.core.min.cjs", format: "cjs", compact: true, sourcemap: true },
    ],
    plugins: [...plugins, browserReplace, terserPlugin],
    treeshake,
  },
];
