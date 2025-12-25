import type { RenderContext } from "./ssr/render-context.js";

/** Lazy-loaded SSR module */
let ssrModule: any;

/** Client-side render context */
let clientRenderContext: RenderContext = { renderContextID: 0, idCounter: 0 };

/**
 * Get the current render context.
 * Returns undefined in browser or if not initialized.
 */
export const getRenderContext = (): RenderContext => {
  // Browser: return the client render context
  if (typeof window !== "undefined") {
    return clientRenderContext;
  }

  // Server: Lazy-load the SSR module
  if (!ssrModule) {
    try {
      ssrModule = require("./ssr/render-context.js");
    } catch (_) {}
  }

  // Fallback to cleint render context
  if (!ssrModule) {
    return clientRenderContext;
  }

  return ssrModule?.getRenderContext();
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
