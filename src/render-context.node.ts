import { AsyncLocalStorage } from "node:async_hooks";
import { setInternalContext } from "./core/render-context-contract";
import type { RenderContext } from "./core/types";

/** Global counter used to distribute render context IDs */
let idCounter: number = 0;

const asyncLocalStorage = new AsyncLocalStorage<RenderContext>();

/**
 * Get the current render context.
 * Returns undefined in browser or if not initialized.
 *
 * @return {(RenderContext | undefined)}
 */
export const getRenderContext = (): RenderContext | undefined => {
  return asyncLocalStorage.getStore();
};

// Pass the SSR getRenderContext to contract
setInternalContext(getRenderContext);

/**
 * Initialize the render context.
 * This is called internally by runWithRenderContext
 *
 * @return {RenderContext}
 */
const initRenderContext = (): RenderContext => {
  const store = asyncLocalStorage.getStore();
  if (!store) {
    throw new Error("initRenderContext must be called within runWithRenderContext");
  }

  // The meaning of life, the Universe, and everything
  store.renderContextID = idCounter++ % 2 ** 42;

  // Initialize element tracking for hydration
  store.idCounter = 0;

  // Initialize Seidr ID counter for this render context
  store.seidrIdCounter = 0;

  // Initialize current path (defaults to root for SSR)
  store.currentPath = "/";

  return store;
};

/**
 * Run a function within a new render context context.
 * This must be used to wrap your SSR render function.
 *
 * @template T - Type of the promise callback resolves to
 *
 * @param {() => Promise<T>} callback - Callback to invoke inside AsyncLocalStorage closure
 * @return {Promise<T>}
 */
export const runWithRenderContext = async <T>(callback: () => Promise<T>): Promise<T> => {
  // Run with new context on the server
  const createStore = (): RenderContext => ({
    renderContextID: 0,
    idCounter: 0,
    seidrIdCounter: 0,
    currentPath: "/"
  });
  return asyncLocalStorage.run(createStore(), async () => {
    initRenderContext();
    return callback();
  });
};

/**
 * Set a mock render context for testing purposes.
 * This provides a simple browser-like render context without requiring AsyncLocalStorage.
 *
 * Use this in tests that need a render context but don't need full SSR functionality.
 *
 * @returns {() => void} Cleanup function to restore the original context
 *
 * @example
 * ```typescript
 * import { setMockRenderContextForTests } from './render-context.node';
 *
 * describe("My Test", () => {
 *   let cleanupContext: () => void;
 *
 *   beforeEach(() => {
 *     cleanupContext = setMockRenderContextForTests();
 *   });
 *
 *   afterEach(() => {
 *     cleanupContext();
 *   });
 * });
 * ```
 */
export const setMockRenderContextForTests = (): (() => void) => {
  const mockContext: RenderContext = {
    renderContextID: 0,
    idCounter: 0,
    seidrIdCounter: 0,
    currentPath: "/"
  };
  const originalGetRenderContext = getRenderContext;

  // Override with a simple function that always returns the mock context
  setInternalContext(() => mockContext);

  // Return cleanup function to restore original
  return () => {
    setInternalContext(originalGetRenderContext);
  };
};
