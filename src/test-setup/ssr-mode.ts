import { getDocument, setInternalGetDocument } from "../dom/get-document";
import { getDocument as getSSRDocument } from "../dom/get-document.node";
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
    vitest: process.env.VITEST as boolean | undefined,
    window: global.window,
    getDocument: getDocument,
  };

  process.env.SEIDR_TEST_SSR = "true";
  setInternalGetDocument(getSSRDocument);
  setInternalRenderContext(getRenderContext);

  return () => {
    if (currentState.seidrSSR !== undefined) process.env.SEIDR_TEST_SSR = currentState.seidrSSR;
    else delete process.env.SEIDR_TEST_SSR;
    if (currentState.vitest !== undefined) process.env.VITEST = currentState.vitest ? "true" : "false";
    else delete process.env.VITEST;
    if (currentState.window !== undefined) global.window = currentState.window;
    setInternalRenderContext(getRenderContext);
    if (currentState.getDocument !== undefined) setInternalGetDocument(currentState.getDocument);
  };
};
