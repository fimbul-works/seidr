import type { TreeshakingOptions } from "tsdown";

export const commonReplace = {
  "process.env.VITEST": "false",
  "process.env.SEIDR_TEST_SSR": "false",
  "process.env.SEIDR_DEBUG": "false",
};

export const mainReplace = {
  ...commonReplace,
  "process.env.SEIDR_ENABLE_SSR": "true",
};

export const clientReplace = {
  ...commonReplace,
  "process.env.USE_SCHEDULER": "true",
  "process.env.SEIDR_ENABLE_SSR": "true",
  "isClient()": "true",
  "isServer()": "false",
};

export const clientNoSSRReplace = {
  ...mainReplace,
  "process.env.USE_SCHEDULER": "true",
  "process.env.SEIDR_ENABLE_SSR": "false",
  "process.env.SSR": "false",
  "isHydrating()": "false",
  "isClient()": "true",
  "isServer()": "false",
};

export const treeshake: TreeshakingOptions = {
  annotations: true,
  commonjs: true,
  moduleSideEffects: "no-external",
  invalidImportSideEffects: false,
  unknownGlobalSideEffects: true,
};
