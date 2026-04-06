/// <reference types="vite/client" />

import { getAppState } from "../../app-state/app-state";
import { isEmpty } from "../type-guards/primitive-types";

/**
 * Returns true if the current environment is the server (Node.js/SSR).
 *
 * @returns {boolean} `true` if in server, `false` otherwise
 */
export const isServer = (): boolean => {
  if (process.env.DISABLE_SSR) {
    return false;
  }

  if (process.env.VITEST) {
    const state = getAppState();
    if (!isEmpty(state?.isSSR)) return state.isSSR;
  }

  return typeof process !== "undefined" && !!(process.env.SEIDR_TEST_SSR || process.env.SSR);
};
