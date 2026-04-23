import type { TreeshakingOptions } from "tsdown";

export const commonReplace = {
  "process.env.VITEST": "false",
  "process.env.SEIDR_TEST_SSR": "false",
  "process.env.SEIDR_DEBUG": "false",
};

export const mainReplace = {
  ...commonReplace,
  "process.env.SEIDR_DISABLE_SSR": "false",
};

export const clientReplace = {
  ...commonReplace,
  "process.env.USE_SCHEDULER": "true",
  "process.env.SEIDR_DISABLE_SSR": "false",
  "isClient()": "true",
  "isServer()": "false",
};

export const clientNoSSRReplace = {
  ...mainReplace,
  "process.env.USE_SCHEDULER": "true",
  "process.env.SEIDR_DISABLE_SSR": "true",
  "import.meta.env.SSR": "false",
  "isHydrating()": "false",
  "isClient()": "true",
  "isServer()": "false",
};

export const treeshake: TreeshakingOptions = {
  annotations: false,
  commonjs: true,
  moduleSideEffects: false,
  invalidImportSideEffects: false,
  unknownGlobalSideEffects: true,
};
