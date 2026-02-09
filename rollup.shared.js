import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import typescript from "@rollup/plugin-typescript";

export const clientReplace = {
  // Production build
  "process.env.NODE_ENV": JSON.stringify("production"),
  "process.env.SEIDR_TEST_SSR": "false",
};

export const nodeReplace = {
  // Production build
  "process.env.NODE_ENV": JSON.stringify("production"),
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

export const makeClientBundle = (input, output, cjs = true, values = {}) => ({
  input,
  output: cjs
    ? [
        { file: `${output}.js`, format: "esm" },
        { file: `${output}.cjs`, format: "cjs" },
      ]
    : [{ file: `${output}.js`, format: "esm" }],
  plugins: [
    ...pluginsCommon,
    replace({
      ...clientReplace,
      "isClient()": "true",
      "isServer()": "false",
      ...values,
      preventAssignment: true,
    }),
  ],
  treeshake,
});

export const makeNodeBundle = (input, output, values = {}) => ({
  input,
  output: [
    { file: `${output}.js`, format: "esm" },
    { file: `${output}.cjs`, format: "cjs" },
  ],
  plugins: [
    ...pluginsCommon,
    replace({ ...nodeReplace, "isClient()": "false", "isServer()": "true", ...values, preventAssignment: true }),
  ],
  treeshake,
  external: ["node:async_hooks"], // Mark Node built-ins as external so they aren't bundled
});
