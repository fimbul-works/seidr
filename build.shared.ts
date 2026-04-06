import type { TreeshakingOptions } from "tsdown";

export const commonReplace = {
  "process.env.VITEST": "false",
  "process.env.SEIDR_TEST_SSR": "false",
  "process.env.DEBUG": "false",
};

export const mainReplace = {
  ...commonReplace,
  "process.env.DISABLE_SSR": "false",
};

export const clientNoSSRReplace = {
  ...mainReplace,
  "process.env.USE_SCHEDULER": "true",
  "process.env.DISABLE_SSR": "true",
  "import.meta.env.SSR": "false",
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
