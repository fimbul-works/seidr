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

export const pluginsNode = [...pluginsCommon, replace(nodeReplace)];
export const pluginsFull = [...pluginsCommon, replace(browserReplace)];
export const treeshake = {
  moduleSideEffects: false,
  propertyReadSideEffects: false,
  unknownGlobalSideEffects: false,
};

export const makeBrowserBundle = (input, output, cjs = true) => ({
  input,
  output: cjs
    ? [
        { file: `${output}.js`, format: "esm" },
        { file: `${output}.cjs`, format: "cjs" },
      ]
    : [{ file: `${output}.js`, format: "esm" }],
  plugins: pluginsFull,
  treeshake,
});

export const makeNodeBundle = (input, output) => ({
  input,
  output: [
    { file: `${output}.js`, format: "esm" },
    { file: `${output}.cjs`, format: "cjs" },
  ],
  plugins: pluginsNode,
  treeshake,
  external: ["node:async_hooks"], // Mark Node built-ins as external so they aren't bundled
});
