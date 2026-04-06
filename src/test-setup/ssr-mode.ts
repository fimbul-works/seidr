import { setAppStateProvider } from "../app-state/app-state";
import { setDocumentProvider } from "../dom/get-document";
import { getSSRDocument } from "../dom/get-document.ssr";
import { Seidr } from "../seidr/seidr";
import { registerSeidrForSSR } from "../ssr/register-seidr";
import type { CleanupFunction } from "../types";
import { clearTestAppState, getAppState } from "./app-state";
import type { TestEnvironmentState } from "./types";

export { resetRequestIdCounter, runWithAppState } from "../app-state/app-state.ssr";
export { clearHydrationData } from "../ssr/hydrate/storage";

/**
 * Enables SSR mode for tests.
 * Performs all necessary global registrations.
 *
 * @returns A cleanup function to restore the previous state.
 */
export const enableSSRMode = (): CleanupFunction => {
  const currentState: TestEnvironmentState = {
    seidrSSR: process.env.SEIDR_TEST_SSR,
    importMetaEnvSSR: process.env.SSR,
    window: global.window,
  };

  process.env.SEIDR_TEST_SSR = "true";
  process.env.SSR = "true";

  // Perform necessary registrations
  Seidr.register = registerSeidrForSSR;
  setAppStateProvider(getAppState);
  setDocumentProvider(getSSRDocument);

  clearTestAppState();
  getAppState().isSSR = true;

  return () => {
    if (currentState.seidrSSR !== undefined) process.env.SEIDR_TEST_SSR = currentState.seidrSSR;
    else delete process.env.SEIDR_TEST_SSR;

    if (currentState.importMetaEnvSSR !== undefined) process.env.SSR = currentState.importMetaEnvSSR;
    else delete process.env.SSR;

    if (currentState.window !== undefined) global.window = currentState.window;
  };
};
