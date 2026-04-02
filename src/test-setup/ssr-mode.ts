import { setInternalAppState } from "../app-state/app-state";
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
    vitest: process.env.VITEST,
    window: global.window,
    // getDocument: getDocument,
    ssrActive: (global as any).__SEIDR_SSR_ACTIVE__,
  };

  clearTestAppState();
  getAppState().isSSR = true;

  process.env.SEIDR_TEST_SSR = "true";
  (global as any).__SEIDR_SSR_ACTIVE__ = true;

  // Perform necessary registrations
  Seidr.register = registerSeidrForSSR;
  setInternalAppState(getAppState);

  return () => {
    if (currentState.seidrSSR !== undefined) process.env.SEIDR_TEST_SSR = currentState.seidrSSR;
    else delete process.env.SEIDR_TEST_SSR;
    if (currentState.vitest !== undefined) process.env.VITEST = currentState.vitest as string;
    else delete process.env.VITEST;
    (global as any).__SEIDR_SSR_ACTIVE__ = currentState.ssrActive;
    if (currentState.window !== undefined) global.window = currentState.window;
  };
};
