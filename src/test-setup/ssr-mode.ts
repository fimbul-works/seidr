import { getDOMFactory, setInternalDOMFactory } from "../dom";
import { getSSRDOMFactory } from "../dom/dom-factory.node";
import { getRenderContext, setInternalContext } from "../render-context";
import type { CleanupFunction } from "../types";
import type { TestEnvironmentState } from "./types";

/**
 * Enables SSR mode for tests.
 *
 * @returns A cleanup function to restore the previous state.
 */
export function enableSSRMode(): CleanupFunction {
  const currentState: TestEnvironmentState = {
    seidrSSR: process.env.SEIDR_TEST_SSR,
    vitest: (process.env as any).VITEST,
    window: (global as any).window,
    getDOMFactory: getDOMFactory,
  };

  process.env.SEIDR_TEST_SSR = "true";
  setInternalDOMFactory(getSSRDOMFactory);
  setInternalContext(getRenderContext);

  return () => {
    if (currentState.seidrSSR !== undefined) process.env.SEIDR_TEST_SSR = currentState.seidrSSR;
    else delete process.env.SEIDR_TEST_SSR;
    if (currentState.vitest !== undefined) (process.env as any).VITEST = currentState.vitest;
    else delete (process.env as any).VITEST;
    if (currentState.window !== undefined) (global as any).window = currentState.window;
    setInternalContext(getRenderContext);
    if (currentState.getDOMFactory !== undefined) setInternalDOMFactory(currentState.getDOMFactory);
  };
}
