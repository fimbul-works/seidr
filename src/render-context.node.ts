import { asyncLocalStorage } from "./als.js";
import { setInternalContext } from "./core/render-context-contract.js";
import type { RenderContext } from "./core/types.js";

/** Global counter used to distribute render context IDs */
let idCounter: number = 0;

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
 * and runWithRenderContextSync.
 *
 * @return {*}  {RenderContext}
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
 *
 * @example
 * ```typescript
 * const count = new Seidr(42);
 * const doubled = count.as(n => n * 2);
 *
 * function App() {
 *   return component((state) => {
 *     return $('div', {}, [
 *       $('span', {}, [`Count: ${count.value}`]),
 *       $('span', {}, [`Doubled: ${doubled.value}`]),
 *     ]);
 *   });
 * };
 *
 * app.get('*', async (req, res) => {
 *   // The HTML and hydrationData can be sent to the client for hydration
 *   const { html, hydrationData } = await runWithRenderContext(async () => {
 *     return await renderToString(App);
 *   });
 *   res.send(html);
 * });
 * ```
 */
export const runWithRenderContext = async <T>(callback: () => Promise<T>): Promise<T> => {
  // Run with new context on the server
  const store: RenderContext = { renderContextID: 0, idCounter: 0 };
  return asyncLocalStorage.run(store, async () => {
    initRenderContext();
    return callback();
  });
};

/**
 * Run a synchronous function within a new render context.
 * Prefer runWithRenderContext for async operations.
 *
 * @template T - Type returned by callback
 *
 * @param {() => T} callback - Callback to invoke inside AsyncLocalStorage closure
 * @return {T}
 */
export const runWithRenderContextSync = <T>(callback: () => T): T => {
  const store: RenderContext = { renderContextID: 0, idCounter: 0 };

  return asyncLocalStorage.run(store, () => {
    initRenderContext();
    return callback();
  });
};
