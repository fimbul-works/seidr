import type { TreeshakingOptions } from "tsdown";

export const clientReplace = {
  "process.env.USE_SCHEDULER": "true",
  "process.env.SSR": "false",
  "process.env.DISABLE_SSR": "false",
  "process.env.VITEST": "false",
  "process.env.SEIDR_TEST_SSR": "false",
  "process.env.DEBUG": "false",
  "isClient()": "true",
  "isServer()": "false",
  "import.meta.env.SSR": "false",
};

export const nodeReplace = {
  "process.env.USE_SCHEDULER": "false",
  "process.env.SSR": "true",
  "process.env.DISABLE_SSR": "false",
  "process.env.VITEST": "false",
  "process.env.SEIDR_TEST_SSR": "false",
  "process.env.DEBUG": "false",
  "isClient()": "false",
  "isServer()": "true",
  window: "undefined",
  "import.meta.env.SSR": "true",
};

export const clientNoSSRReplace = {
  ...clientReplace,
  "process.env.DISABLE_SSR": "true",
  "isHydrating()": "false",
};

export const treeshake: TreeshakingOptions = {
  annotations: true,
  commonjs: true,
  moduleSideEffects: "no-external",
  invalidImportSideEffects: false,
  unknownGlobalSideEffects: true,
};
