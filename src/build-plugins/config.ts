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
  "process.env.USE_SCHEDULER": "false",
  "process.env.SEIDR_DISABLE_SSR": "false",
  "isClient()": "false",
  "isServer()": "true",
  "isHydrating()": "false",
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
  "process.env.USE_SCHEDULER": "true",
  "process.env.SEIDR_DISABLE_SSR": "false",
  "isClient()": "true",
  "isServer()": "false",
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
  "process.env.SEIDR_DISABLE_SSR": "true",
  "isHydrating()": "false",
};
