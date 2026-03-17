import { getAppState } from "../../app-state/app-state";

/**
 * Returns true if the current environment is the server (Node.js/SSR).
 *
 * @returns {boolean} `true` if in server, `false` otherwise
 */
export const isServer = () => {
  if (process.env.CODE_DISABLE_SSR) {
    return false;
  }

  const state = getAppState();
  if (process.env.VITEST && state?.isSSR !== undefined) return state.isSSR;

  if (typeof process !== "undefined" && (process.env.SSR || process.env.SEIDR_TEST_SSR)) return true;
  if (typeof import.meta !== "undefined") {
    const env = import.meta.env;
    if (env?.SSR) return true;
    if (env?.env?.SSR) return true;
  }
  return false;
};
