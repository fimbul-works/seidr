import { getDocument, setInternalGetDocument } from "../dom/get-document";
import { getDocument as getBrowserDocument } from "../dom/get-document.browser";
import { setInternalRenderContext } from "../render-context/render-context";
import type { CleanupFunction } from "../types";
import { isClient } from "../util/environment/client";
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
    getDocument: getDocument,
  };

  delete process.env.SEIDR_TEST_SSR;
  delete (process.env as any).VITEST;

  if (!isClient()) {
    (global as any).window = currentState.window || {};
  }

  setInternalRenderContext(getRenderContext);
  setInternalGetDocument(getBrowserDocument);

  return () => {
    if (currentState.seidrSSR !== undefined) process.env.SEIDR_TEST_SSR = currentState.seidrSSR;
    else delete process.env.SEIDR_TEST_SSR;
    if (currentState.vitest !== undefined) (process.env as any).VITEST = currentState.vitest;
    else delete (process.env as any).VITEST;
    if (currentState.window !== undefined) (global as any).window = currentState.window;
    if (currentState.getDocument !== undefined) setInternalGetDocument(currentState.getDocument);
  };
}
