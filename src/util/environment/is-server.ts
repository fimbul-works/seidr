/// <reference types="vite/client" />

import { getAppState } from "../../app-state/app-state.js";
import { isEmpty } from "../type-guards/primitive-types.js";

/**
 * Returns true if the current environment is the server (Node.js/SSR).
 *
 * @returns {boolean} `true` if in server, `false` otherwise
 */
export const isServer = (): boolean => {
  if (process.env.SEIDR_DISABLE_SSR) {
    return false;
  }

  if (typeof process === "undefined") {
    return false;
  }

  if (process.env.VITEST) {
    const state = getAppState();
    if (!isEmpty(state.isSSR)) {
      return state.isSSR;
    }
  }

  return (import.meta.env.SSR ?? typeof window === "undefined") || !!process.env.SEIDR_TEST_SSR;
};
