import { AsyncLocalStorage } from "node:async_hooks";

/**
 * RenderContexxt is used in server-side rendering.
 */
export interface RenderContext {
  /** Render context ID is used to differentiate render context between requests */
  renderContextID: number;
}

/** AsyncLocalStoage instance */
export const asyncLocalStorage = new AsyncLocalStorage<RenderContext>();

/** Global counter used to distribute render context IDs */
let idCounter = 0;

/**
 * Get the current render context.
 * Returns undefined in browser or if not initialized.
 */
export const getRenderContext = (): RenderContext | undefined => {
  // Server-side rendering check: window === undefined || process.env.SEIDR_TEST_SSR === true
  if (typeof window !== "undefined" || typeof process === "undefined" || process.env.SEIDR_TEST_SSR) {
    return undefined;
  }
  return asyncLocalStorage.getStore();
};

/**
 * Initialize the render context.
 * This is called internally by runWithRenderContext
 * and runWithRenderContextSync.
 */
const initRenderContext = (): void => {
  const store = getRenderContext();
  if (!store) {
    throw new Error("initRenderContext must be called within runWithRenderContext");
  }
  // The meaning of life, the Universe, and everything
  store.renderContextID = idCounter++ % 2 ** 42;
};

/**
 * Run a function within a new render context context.
 * This must be used to wrap your SSR render function.
 *
 * @example
 * ```ts
 * app.get('*', async (req, res) => {
 *   const html = await runWithRenderContext(async () => {
 *     return await renderToString(MyComponent);
 *   });
 *   res.send(html);
 * });
 * ```
 */
export const runWithRenderContext = async <T>(callback: () => Promise<T>): Promise<T> => {
  if (!asyncLocalStorage) {
    // Browser: just run the callback
    return callback();
  }

  // Run with new context on the server
  const store: RenderContext = { renderContextID: 0 };
  return asyncLocalStorage.run(store, async () => {
    initRenderContext();
    return callback();
  });
};

/**
 * Run a synchronous function within a new render context.
 * Prefer runWithRenderContext for async operations.
 */
export const runWithRenderContextSync = <T>(callback: () => T): T => {
  const store: RenderContext = { renderContextID: 0 };

  return asyncLocalStorage.run(store, () => {
    initRenderContext();
    return callback();
  });
};
