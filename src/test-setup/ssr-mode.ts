import { setAppStateProvider } from "../app-state/app-state.js";
import { setDocumentProvider } from "../dom/get-document.js";
import { getSSRDocument } from "../dom/get-document.ssr.js";
import { Seidr } from "../seidr/seidr.js";
import { registerSeidrForSSR } from "../ssr/register-seidr-for-ssr.js";
import type { CleanupFunction } from "../types.js";
import { clearTestAppState, getAppState } from "./app-state.js";
import type { TestEnvironmentState } from "./types.js";

export { resetRequestIdCounter, runWithAppState } from "../app-state/app-state.ssr.js";
export { clearHydrationData } from "../ssr/hydrate/storage.js";

/**
 * Enables SSR mode for tests.
 * Performs all necessary global registrations.
 *
 * @returns A cleanup function to restore the previous state.
 */
export const enableSSRMode = (): CleanupFunction => {
  const currentState: TestEnvironmentState = {
    seidrSSR: process.env.SEIDR_TEST_SSR,
    importMetaEnvSSR: import.meta.env.SSR,
    window: global.window,
  };

  process.env.SEIDR_TEST_SSR = "true";
  import.meta.env.SSR = true;

  // Perform necessary registrations
  Seidr.register = registerSeidrForSSR;
  setAppStateProvider(getAppState);
  setDocumentProvider(getSSRDocument);

  clearTestAppState();
  getAppState().isSSR = true;

  return () => {
    if (currentState.seidrSSR !== undefined) process.env.SEIDR_TEST_SSR = currentState.seidrSSR;
    else delete process.env.SEIDR_TEST_SSR;

    if (currentState.importMetaEnvSSR !== undefined) import.meta.env.SSR = currentState.importMetaEnvSSR;
    else import.meta.env.SSR = false;

    if (currentState.window !== undefined) global.window = currentState.window;
  };
};
