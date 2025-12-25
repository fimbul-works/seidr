import type { RenderContext } from "./ssr/render-context.js";

/** Lazy-loaded SSR module */
let ssrModule: any;
try {
  // This will only execute on server
  if (typeof window === "undefined") {
    ssrModule = await import("./ssr/render-context.js");
  }
} catch {}

/** Client-side render context */
let clientRenderContext: RenderContext = { renderContextID: 0, idCounter: 0 };

/**
 * Get the current render context.
 * Returns the client context in browser, or the SSR context on the server.
 *
 * @throws {Error} If called on the server but SSR module failed to load
 */
export const getRenderContext = (): RenderContext => {
  // Browser: return the client render context
  if (typeof window !== "undefined") {
    return clientRenderContext;
  }

  if (!ssrModule) {
    throw new Error("Error loading AsyncSessionStorage SSR module");
  }

  const ctx = ssrModule?.getRenderContext();
  if (!ctx) {
    throw new Error(
      "SSR render context is undefined. Make sure you're calling this within runWithRenderContext() or runWithRenderContextSync().",
    );
  }

  return ctx;
};

/**
 * Set the render context on the client side.
 * Used during hydration to restore the server's render context ID.
 *
 * @param renderContextID - The render context ID from the server
 */
export const setClientRenderContext = (renderContextID: number): void => {
  clientRenderContext = {
    renderContextID,
    idCounter: 0,
  };
};

/**
 * Clear the client-side render context.
 */
export const resetClientRenderContext = (): void => setClientRenderContext(0);

/**
 * Increment the render context ID counter.
 */
export const incrIdCounter = (): void => {
  getRenderContext().idCounter++;
};
