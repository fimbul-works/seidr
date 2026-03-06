/// <reference types="vite/types/importMeta.d.ts" />

/**
 * Returns true if the current environment is the server (Node.js/SSR).
 *
 * @returns {boolean} `true` if in server, `false` otherwise
 */
export const isServer = () => {
  if (typeof process !== "undefined" && (process.env.SSR || process.env.SEIDR_TEST_SSR)) return true;
  if (typeof import.meta !== "undefined") {
    const env = import.meta.env;
    if (env.SSR) return true;
    if (env.env?.SSR) return true;
  }
  return false;
};
