const IS_TEST = "process.env.VITEST";
const IS_SSR_TEST = "process.env.SEIDR_TEST_SSR";

const SEIDR_DISABLE_SSR = "process.env.SEIDR_DISABLE_SSR";
const SEIDR_USE_SCHEDULER = "process.env.SEIDR_USE_SCHEDULER";

const IS_CLIENT = "isClient()";
const IS_SERVER = "isServer()";
const IS_HYDRATING = "isHydrating()";

/**
 * Common replacements for Seidr builds.
 */
export const commonReplace = {
  [IS_TEST]: "false",
  [IS_SSR_TEST]: "false",
};

/**
 * Replacements for server-side rendering builds.
 */
export const serverReplace = {
  ...commonReplace,
  [SEIDR_USE_SCHEDULER]: "false",
  [SEIDR_DISABLE_SSR]: "false",
  [IS_CLIENT]: "false",
  [IS_SERVER]: "true",
  [IS_HYDRATING]: "false",
  "import.meta.env.SSR": "true",
  "import.meta.env?.SSR": "true",
  'typeof window !== "undefined"': "false",
  'typeof process === "undefined"': "false",
};

/**
 * Replacements for client-side rendering builds in SSR mode.
 */
export const clientReplace = {
  ...commonReplace,
  [SEIDR_USE_SCHEDULER]: "true",
  [SEIDR_DISABLE_SSR]: "false",
  [IS_CLIENT]: "true",
  [IS_SERVER]: "false",
  "import.meta.env.SSR": "false",
  "import.meta.env?.SSR": "false",
  'typeof window !== "undefined"': "true",
  'typeof process === "undefined"': "true",
};

/**
 * Replacements for client-side rendering builds in non-SSR mode.
 */
export const clientOnlyReplacements = {
  ...clientReplace,
  [SEIDR_DISABLE_SSR]: "true",
  [IS_HYDRATING]: "false",
};
