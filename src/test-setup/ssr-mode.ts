import { setAppStateProvider } from "../app-state/app-state";
import { Seidr } from "../seidr/seidr";
import { registerSeidrForSSR } from "../ssr/register-seidr";
import type { CleanupFunction } from "../types";
import { clearTestAppState, getAppState } from "./app-state";
import type { TestEnvironmentState } from "./types";

export { resetRequestIdCounter, runWithAppState } from "../app-state/app-state.server";
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
    window: global.window,
  };

  process.env.SEIDR_TEST_SSR = "true";

  // Perform necessary registrations
  Seidr.register = registerSeidrForSSR;
  setAppStateProvider(getAppState);

  clearTestAppState();
  getAppState().isSSR = true;

  return () => {
    if (currentState.seidrSSR !== undefined) process.env.SEIDR_TEST_SSR = currentState.seidrSSR;
    else delete process.env.SEIDR_TEST_SSR;
    if (currentState.window !== undefined) global.window = currentState.window;
  };
};
