import { setAppStateProvider } from "../app-state/app-state.js";
import { defaultClientDocument, setDocumentProvider } from "../dom/get-document.js";
import { Seidr } from "../seidr/seidr.js";
import { registerSeidrForSSR } from "../ssr/register-seidr-for-ssr.js";
import type { CleanupFunction } from "../types.js";
import { isClient } from "../util/environment/is-client.js";
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
    importMetaEnvSSR: import.meta.env.SSR,
    window: global.window,
  };

  clearTestAppState();
  getAppState().isSSR = false;

  delete process.env.SEIDR_TEST_SSR;
  import.meta.env.SSR = false;

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

    if (currentState.importMetaEnvSSR !== undefined) import.meta.env.SSR = currentState.importMetaEnvSSR;
    else import.meta.env.SSR = false;

    if (currentState.window !== undefined) global.window = currentState.window;
  };
}
