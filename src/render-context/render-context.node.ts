import { AsyncLocalStorage } from "node:async_hooks";
import type { CleanupFunction } from "../types";
import { setInternalContext } from "./render-context";
import type { RenderContext, RenderContextStore } from "./types";

/** Global fallback store for ID generation */
const globalRenderContextStore: RenderContextStore = { idCounter: 0 };

/** Reset the global ID counter (for testing) */
export function resetIdCounter(): void {
  globalRenderContextStore.idCounter = 0;
}

/**
 * Storage for the RenderContextStore (the ID generator).
 * This allows isolating groups of requests (e.g. in tests).
 */
const managerLocalStorage = new AsyncLocalStorage<RenderContextStore>();

/** Storage for the actual per-request RenderContext */
const contextLocalStorage = new AsyncLocalStorage<RenderContext>();

// Expose store globally for test-setup access in tests
if (typeof global !== "undefined") {
  (global as any).__SEIDR_CONTEXT_STORE__ = contextLocalStorage;
}

/**
 * Get the current render context.
 *
 * @return {RenderContext}
 */
export const getSSRRenderContext = (): RenderContext => {
  const store = contextLocalStorage.getStore();
  if (!store) throw new Error("RenderContext not initialized");
  return store;
};

// Pass the SSR getRenderContext to contract
setInternalContext(getSSRRenderContext);

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
  const store = managerLocalStorage.getStore() || globalRenderContextStore;
  const ctxID = store.idCounter++;

  const context: RenderContext = {
    ctxID,
    idCounter: 0,
    seidrIdCounter: 0,
    randomCounter: 0,
    currentPath: "/",
    fragmentOwners: new WeakMap(),
    fragmentChildren: new WeakMap(),
  };

  return contextLocalStorage.run(context, callback);
};

/**
 * Run a sync function within a new render context store.
 * This is used to isolate ID generation (e.g. for deterministic tests).
 *
 * @template T - Return type
 * @param {() => T} callback - Function to run
 * @param {RenderContextStore} [store] - Optional store to use
 * @returns {T}
 */
export function runWithRenderContextStore<T>(callback: () => T, store: RenderContextStore = { idCounter: 0 }): T {
  return managerLocalStorage.run(store, callback);
}

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
    idCounter: 0,
    seidrIdCounter: 0,
    randomCounter: 0,
    currentPath: "/",
    fragmentOwners: new WeakMap(),
    fragmentChildren: new WeakMap(),
  };
  const originalGetRenderContext = getSSRRenderContext;

  // Override with a simple function that always returns the mock context
  setInternalContext(() => mockContext);

  // Return cleanup function to restore original
  return () => {
    setInternalContext(originalGetRenderContext);
  };
};
