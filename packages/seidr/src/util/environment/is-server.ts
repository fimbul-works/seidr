/// <reference types="vite/client" />

import { isFn, isNullish } from "@fimbul-works/hvat";
import { getAppState } from "../../app-state/get-app-state.js";
import { DATA_KEY_IS_SSR } from "../../constants.js";

/**
 * Returns true if the current environment is the server (Node.js/SSR).
 *
 * @returns {boolean} `true` if in server, `false` otherwise
 */
export const isServer = (): boolean => {
  if (typeof process === "undefined") {
    return false;
  }

  if (process.env.VITEST && isFn(getAppState)) {
    const isSSR = getAppState()?.getData<boolean>(DATA_KEY_IS_SSR);
    if (!isNullish(isSSR)) {
      return isSSR;
    }
  }

  if (process.env.SEIDR_DISABLE_SSR) {
    return false;
  }

  return (import.meta.env?.SSR ?? typeof window === "undefined") || !!process.env.SEIDR_TEST_SSR;
};
