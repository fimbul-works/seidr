/// <reference types="vite/client" />

import { getAppState } from "../../app-state/app-state.js";
import { isEmpty } from "../type-guards/primitive-types.js";

/**
 * Returns true if the current environment is the browser.
 *
 * @returns {boolean} `true` if in browser, `false` otherwise
 */
export const isClient = (): boolean => {
  if (process.env.SEIDR_DISABLE_SSR) {
    return true;
  }

  if (process.env.VITEST) {
    const state = getAppState();
    if (!isEmpty(state.isSSR)) {
      return !state.isSSR;
    }
  }

  return typeof window !== "undefined" && !(import.meta.env.SSR || process.env.SEIDR_TEST_SSR);
};
