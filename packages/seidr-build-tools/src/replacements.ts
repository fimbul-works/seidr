const IS_CLIENT = "isClient()";
const IS_SERVER = "isServer()";
const SEIDR_DISABLE_SSR = "process.env.SEIDR_DISABLE_SSR";

/**
 * Common replacements for Seidr builds.
 */
export const commonReplace = {
  "process.env.VITEST": "false",
  "process.env.SEIDR_TEST_SSR": "false",
};

/**
 * Replacements for server-side rendering builds.
 */
export const serverReplace = {
  ...commonReplace,
  [SEIDR_DISABLE_SSR]: "false",
  [IS_CLIENT]: "false",
  [IS_SERVER]: "true",
  "isHydrating()": "false",
  "import.meta.env.SSR": "true",
  "import.meta.env?.SSR": "true",
  "typeof window": "'undefined'",
  "typeof process": "{}",
};

/**
 * Replacements for client-side rendering builds in SSR mode.
 */
export const clientReplace = {
  ...commonReplace,
  [SEIDR_DISABLE_SSR]: "false",
  [IS_CLIENT]: "true",
  [IS_SERVER]: "false",
  "import.meta.env.SSR": "false",
  "import.meta.env?.SSR": "false",
  "typeof window": "{}",
  "typeof process": "'undefined'",
};

/**
 * Replacements for client-side rendering builds in non-SSR mode.
 */
export const clientOnlyReplacements = {
  ...clientReplace,
  [SEIDR_DISABLE_SSR]: "true",
  "isHydrating()": "false",
};
