export const clientReplace = {
  "process.env.SEIDR_TEST_SSR": "false",
  "process.env.USE_SCHEDULER": "true",
  "process.env.VITEST": "false",
  "process.env.DEBUG": "false",
  "isClient()": "true",
  "isServer()": "false",
  "import.meta.env.SSR": "false",
  "process.env.SSR": "false",
};

export const nodeReplace = {
  "process.env.SEIDR_TEST_SSR": "false",
  "process.env.USE_SCHEDULER": "false",
  "process.env.VITEST": "false",
  "process.env.DEBUG": "false",
  "isClient()": "false",
  "isServer()": "true",
  window: "undefined",
};

export const clientNoSSRReplace = {
  "process.env.CORE_DISABLE_SSR": "true",
  "isHydrating()": "false",
};
