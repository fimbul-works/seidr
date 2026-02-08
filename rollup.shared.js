import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import typescript from "@rollup/plugin-typescript";

export const browserReplace = {
  // Production build
  "process.env.NODE_ENV": '"production"',
  "process.env.SEIDR_TEST_SSR": "false",
};

export const nodeReplace = {
  // Production build
  "process.env.NODE_ENV": '"production"',
  "process.env.SEIDR_TEST_SSR": "false",
  // Disable client bundle guards
  window: "undefined",
};

const pluginsCommon = [typescript({ tsconfig: "./tsconfig.json", declaration: false }), resolve(), commonjs()];

export const treeshake = {
  moduleSideEffects: false,
  propertyReadSideEffects: false,
  unknownGlobalSideEffects: false,
};

export const makeBrowserBundle = (input, output, cjs = true, replacements = {}) => ({
  input,
  output: cjs
    ? [
        { file: `${output}.js`, format: "esm" },
        { file: `${output}.cjs`, format: "cjs" },
      ]
    : [{ file: `${output}.js`, format: "esm" }],
  plugins: [
    ...pluginsCommon,
    replace({ ...browserReplace, "isServer()": "false", ...replacements, preventAssignment: true }),
  ],
  treeshake,
});

export const makeNodeBundle = (input, output, replacements = {}) => ({
  input,
  output: [
    { file: `${output}.js`, format: "esm" },
    { file: `${output}.cjs`, format: "cjs" },
  ],
  plugins: [...pluginsCommon, replace({ ...nodeReplace, ...replacements, preventAssignment: true })],
  treeshake,
  external: ["node:async_hooks"], // Mark Node built-ins as external so they aren't bundled
});
