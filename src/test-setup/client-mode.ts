import { setInternalAppState } from "../app-state/app-state";
import { getDocument, setInternalGetDocument } from "../dom/get-document";
import { getDocument as getBrowserDocument } from "../dom/get-document.client";
import { Seidr } from "../seidr/seidr";
import { registerSeidrForSSR } from "../ssr/register-seidr";
import type { CleanupFunction } from "../types";
import { isClient } from "../util/environment/client";
import { clearTestAppState, getAppState } from "./app-state";
import type { TestEnvironmentState } from "./types";

/**
 * Enables client-side rendering mode for tests.
 * Performs all necessary global registrations.
 *
 * @returns A cleanup function to restore the previous state.
 */
export function enableClientMode(): CleanupFunction {
  const currentState: TestEnvironmentState = {
    seidrSSR: process.env.SEIDR_TEST_SSR,
    vitest: process.env.VITEST,
    window: global.window,
    getDocument: getDocument,
  };

  clearTestAppState();
  getAppState().isSSR = false;

  delete process.env.SEIDR_TEST_SSR;

  // Perform necessary registrations
  Seidr.register = registerSeidrForSSR;
  setInternalGetDocument(getBrowserDocument);
  setInternalAppState(getAppState);

  if (!isClient()) {
    global.window = currentState.window || {};
  }

  return () => {
    if (currentState.seidrSSR !== undefined) process.env.SEIDR_TEST_SSR = currentState.seidrSSR;
    else delete process.env.SEIDR_TEST_SSR;
    if (currentState.vitest !== undefined) process.env.VITEST = currentState.vitest;
    else delete process.env.VITEST;
    if (currentState.window !== undefined) global.window = currentState.window;
    if (currentState.getDocument !== undefined) setInternalGetDocument(currentState.getDocument);
  };
}
