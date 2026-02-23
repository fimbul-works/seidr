import { AsyncLocalStorage } from "node:async_hooks";
import { type CleanupFunction, SeidrError } from "../types";
import { setInternalRenderContext } from "./render-context";
import type { RenderContext } from "./types";

/** Global fallback store for request ID generation */
let requestIdCounter = 0;

/** Reset the global ID counter (for testing) */
export const resetRequestIdCounter = () => (requestIdCounter = 0);

/** Storage for per-request RenderContext */
const contextLocalStorage = new AsyncLocalStorage<RenderContext>();

// Expose store globally for test-setup access in tests
if (process.env.VITEST && typeof global !== "undefined") {
  (global as any).__SEIDR_CONTEXT_STORE__ = contextLocalStorage;
}

/**
 * Get the current render context.
 *
 * @return {RenderContext}
 */
export const getSSRRenderContext = (): RenderContext => {
  const store = contextLocalStorage.getStore();
  if (!store) throw new SeidrError("RenderContext not initialized");
  return store;
};

// Pass the SSR getRenderContext to contract
setInternalRenderContext(getSSRRenderContext);

/**
 * Run a function within a new render context.
 * This must be used to wrap your SSR render function.
 *
 * @template T - Type of the promise callback resolves to
 *
 * @param {() => Promise<T>} callback - Callback to invoke inside AsyncLocalStorage closure
 * @return {Promise<T>}
 */
export const runWithRenderContext = async <T>(callback: () => Promise<T>): Promise<T> => {
  const ctxID = requestIdCounter++;

  const context: RenderContext = {
    ctxID,
    sID: 0,
    cID: 0,
    markers: new Map<string, [Comment, Comment]>(),
    featureData: new Map<string, any>(),
  };

  return contextLocalStorage.run(context, callback);
};

/**
 * Set a mock render context for testing purposes.
 * This provides a simple browser-like render context without requiring AsyncLocalStorage.
 *
 * Use this in tests that need a render context but don't need full SSR functionality.
 *
 * @returns {CleanupFunction} Cleanup function to restore the original context
 */
export const setMockRenderContextForTests = (): CleanupFunction => {
  const mockContext: RenderContext = {
    ctxID: 0,
    sID: 0,
    cID: 0,
    markers: new Map<string, [Comment, Comment]>(),
    featureData: new Map<string, any>(),
  };
  const originalGetRenderContext = getSSRRenderContext;

  // Override with a simple function that always returns the mock context
  setInternalRenderContext(() => mockContext);

  // Return cleanup function to restore original
  return () => setInternalRenderContext(originalGetRenderContext);
};
