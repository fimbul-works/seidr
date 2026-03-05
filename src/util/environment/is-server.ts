/// <reference types="vite/types/importMeta.d.ts" />

/**
 * Returns true if the current environment is the server (Node.js/SSR).
 *
 * @returns {boolean} `true` if in server, `false` otherwise
 */
export const isServer = (): boolean =>
  (typeof window === "undefined" && import.meta.env.SSR) ||
  (typeof process !== "undefined" && !!process.env.SEIDR_TEST_SSR);
