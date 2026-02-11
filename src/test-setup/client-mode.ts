import { getDOMFactory, setInternalDOMFactory } from "../dom/dom-factory";
import { getBrowserDOMFactory } from "../dom/dom-factory.browser";
import { setInternalRenderContext } from "../render-context/render-context";
import type { CleanupFunction } from "../types";
import { isClient } from "../util/environment/browser";
import { getRenderContext } from "./render-context";
import type { TestEnvironmentState } from "./types";

/**
 * Enables client-side rendering mode for tests.
 *
 * @returns A cleanup function to restore the previous state.
 */
export function enableClientMode(): CleanupFunction {
  const currentState: TestEnvironmentState = {
    seidrSSR: process.env.SEIDR_TEST_SSR,
    vitest: (process.env as any).VITEST,
    window: (global as any).window,
    getDOMFactory: getDOMFactory,
  };

  delete process.env.SEIDR_TEST_SSR;
  delete (process.env as any).VITEST;

  if (!isClient()) {
    (global as any).window = currentState.window || {};
  }

  setInternalRenderContext(getRenderContext);
  setInternalDOMFactory(getBrowserDOMFactory);

  return () => {
    if (currentState.seidrSSR !== undefined) process.env.SEIDR_TEST_SSR = currentState.seidrSSR;
    else delete process.env.SEIDR_TEST_SSR;
    if (currentState.vitest !== undefined) (process.env as any).VITEST = currentState.vitest;
    else delete (process.env as any).VITEST;
    if (currentState.window !== undefined) (global as any).window = currentState.window;
    if (currentState.getDOMFactory !== undefined) setInternalDOMFactory(currentState.getDOMFactory);
  };
}
