import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import typescript from "@rollup/plugin-typescript";
import esbuild from "rollup-plugin-esbuild";

export const clientReplace = {
  "process.env.SEIDR_TEST_SSR": "false",
  "process.env.USE_SCHEDULER": "true",
  "process.env.VITEST": "false",
  "process.env.DEBUG": "false",
};

export const nodeReplace = {
  "process.env.SEIDR_TEST_SSR": "false",
  "process.env.USE_SCHEDULER": "false",
  "process.env.VITEST": "false",
  "process.env.DEBUG": "false",
  window: "undefined",
};

const pluginsCommon = [typescript({ tsconfig: "./tsconfig.json", declaration: false }), resolve(), commonjs()];
const treeshake = "smallest";

/**
 * @returns {import('rollup').RollupOptions}
 */
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
    esbuild({ target: "esnext", platform: "browser" }),
  ],
  treeshake,
  context: "window",
});

export const makeNodeBundle = (input, output, cjs = true, values = {}, esbuildOptions = {}) => ({
  input,
  output: cjs
    ? [
        { file: `${output}.js`, format: "esm" },
        { file: `${output}.cjs`, format: "cjs" },
      ]
    : [{ file: `${output}.js`, format: "esm" }],
  plugins: [
    ...pluginsCommon,
    replace({ ...nodeReplace, "isClient()": "false", "isServer()": "true", ...values, preventAssignment: true }),
    esbuild({ target: "esnext", platform: "node", ...esbuildOptions }),
  ],
  treeshake,
  external: ["node:async_hooks"], // Mark Node built-ins as external so they aren't bundled
});

export const makeTestBundle = (input, output, cjs = false, values = {}) => ({
  input,
  output: cjs
    ? [
        { file: `${output}.js`, format: "esm" },
        { file: `${output}.cjs`, format: "cjs" },
      ]
    : [{ file: `${output}.js`, format: "esm" }],
  plugins: [...pluginsCommon, replace({ ...values, preventAssignment: true })],
  treeshake,
  external: ["vitest"], // Mark Node built-ins as external so they aren't bundled
});
