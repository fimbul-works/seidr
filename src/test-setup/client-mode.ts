import { setInternalAppState } from "../app-state/app-state";
import { getDocument, setInternalGetDocument } from "../dom/get-document";
import { getDocument as getBrowserDocument } from "../dom/get-document.browser";
import type { CleanupFunction } from "../types";
import { isClient } from "../util/environment/client";
import { getAppState } from "./app-state";
import type { TestEnvironmentState } from "./types";

/**
 * Enables client-side rendering mode for tests.
 *
 * @returns A cleanup function to restore the previous state.
 */
export function enableClientMode(): CleanupFunction {
  const currentState: TestEnvironmentState = {
    seidrSSR: process.env.SEIDR_TEST_SSR,
    vitest: process.env.VITEST as boolean | undefined,
    window: global.window,
    getDocument: getDocument,
  };

  delete process.env.SEIDR_TEST_SSR;
  delete process.env.VITEST;

  if (!isClient()) {
    global.window = currentState.window || {};
  }

  setInternalAppState(getAppState);
  setInternalGetDocument(getBrowserDocument);

  return () => {
    if (currentState.seidrSSR !== undefined) process.env.SEIDR_TEST_SSR = currentState.seidrSSR;
    else delete process.env.SEIDR_TEST_SSR;
    if (currentState.vitest !== undefined) process.env.VITEST = currentState.vitest ? "true" : "false";
    else delete process.env.VITEST;
    if (currentState.window !== undefined) global.window = currentState.window;
    if (currentState.getDocument !== undefined) setInternalGetDocument(currentState.getDocument);
  };
}
