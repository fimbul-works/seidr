import { getDOMFactory, setInternalDOMFactory } from "../dom/dom-factory";
import { getSSRDOMFactory } from "../dom/dom-factory.node";
import { getRenderContext, setInternalRenderContext } from "../render-context/render-context";
import type { CleanupFunction } from "../types";
import type { TestEnvironmentState } from "./types";

/**
 * Enables SSR mode for tests.
 *
 * @returns A cleanup function to restore the previous state.
 */
export const enableSSRMode = (): CleanupFunction => {
  const currentState: TestEnvironmentState = {
    seidrSSR: process.env.SEIDR_TEST_SSR,
    vitest: (process.env as any).VITEST,
    window: (global as any).window,
    getDOMFactory: getDOMFactory,
  };

  process.env.SEIDR_TEST_SSR = "true";
  setInternalDOMFactory(getSSRDOMFactory);
  setInternalRenderContext(getRenderContext);

  return () => {
    if (currentState.seidrSSR !== undefined) process.env.SEIDR_TEST_SSR = currentState.seidrSSR;
    else delete process.env.SEIDR_TEST_SSR;
    if (currentState.vitest !== undefined) (process.env as any).VITEST = currentState.vitest;
    else delete (process.env as any).VITEST;
    if (currentState.window !== undefined) (global as any).window = currentState.window;
    setInternalRenderContext(getRenderContext);
    if (currentState.getDOMFactory !== undefined) setInternalDOMFactory(currentState.getDOMFactory);
  };
};
