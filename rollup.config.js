import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
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
const pluginsFull = [...pluginsCommon, replace(browserReplace)];

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
];
