import type { RenderContext } from "../render-context";

// Set up a simple browser render context that returns a valid context object
export const testRenderContext: RenderContext = {
  ctxID: 0,
  idCounter: 0,
  currentPath: "/",
  markers: new Map<string, [Comment, Comment]>(),
};

/**
 * Set the render context ID for tests.
 */
export const setRenderContextID = (id: number): void => {
  testRenderContext.ctxID = id;
};

/**
 * Robust getRenderContext for tests.
 * Prefers AsyncLocalStorage if available (SSR), falls back to testRenderContext.
 */
export const getRenderContext = (): RenderContext =>
  (global as any).__SEIDR_CONTEXT_STORE__?.getStore() ?? testRenderContext;
