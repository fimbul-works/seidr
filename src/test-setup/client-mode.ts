import { setAppStateProvider } from "../app-state/app-state.js";
import { defaultClientDocument, setDocumentProvider } from "../dom/get-document.js";
import { Seidr } from "../seidr/seidr.js";
import { registerSeidrForSSR } from "../ssr/register-seidr.js";
import type { CleanupFunction } from "../types.js";
import { isClient } from "../util/environment/client.js";
import { clearTestAppState, getAppState } from "./app-state.js";
import type { TestEnvironmentState } from "./types.js";

/**
 * Enables client-side rendering mode for tests.
 * Performs all necessary global registrations.
 *
 * @returns A cleanup function to restore the previous state.
 */
export function enableClientMode(): CleanupFunction {
  const currentState: TestEnvironmentState = {
    seidrSSR: process.env.SEIDR_TEST_SSR,
    importMetaEnvSSR: process.env.SSR,
    window: global.window,
  };

  clearTestAppState();
  getAppState().isSSR = false;

  delete process.env.SEIDR_TEST_SSR;
  delete process.env.SSR;

  // Perform necessary registrations
  Seidr.register = registerSeidrForSSR;
  setAppStateProvider(getAppState);
  setDocumentProvider(defaultClientDocument);

  if (!isClient()) {
    global.window = currentState.window || {};
  }

  return () => {
    if (currentState.seidrSSR !== undefined) process.env.SEIDR_TEST_SSR = currentState.seidrSSR;
    else delete process.env.SEIDR_TEST_SSR;

    if (currentState.importMetaEnvSSR !== undefined) process.env.SSR = currentState.importMetaEnvSSR;
    else delete process.env.SSR;

    if (currentState.window !== undefined) global.window = currentState.window;
  };
}
