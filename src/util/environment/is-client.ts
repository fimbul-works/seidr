/// <reference types="vite/client" />

import { getAppState } from "../../app-state/app-state.js";
import { DATA_KEY_IS_SSR } from "../../constants.js";
import { isFn, isNullish } from "../type-guards.js";

/**
 * Returns true if the current environment is the browser.
 *
 * @returns {boolean} `true` if in browser, `false` otherwise
 */
export const isClient = (): boolean => {
  if (process.env.VITEST && isFn(getAppState)) {
    const state = getAppState();
    const isSSR = state?.getData<boolean>(DATA_KEY_IS_SSR);
    if (!isNullish(isSSR)) {
      return !isSSR;
    }
  }

  if (process.env.SEIDR_DISABLE_SSR) {
    return true;
  }

  return typeof window !== "undefined" && !(import.meta.env.SSR || process.env.SEIDR_TEST_SSR);
};
