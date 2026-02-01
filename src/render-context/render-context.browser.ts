import { setInternalContext } from "./render-context";
import type { RenderContext } from "./types";

/** @type {RenderContext} Client-side render context */
const clientRenderContext: RenderContext = {
  ctxID: 0,
  idCounter: 0,
  seidrIdCounter: 0,
  randomCounter: 0,
  currentPath: typeof window !== "undefined" ? window.location.pathname : "/",
};

/**
 * Set the render context ID (used during hydration to match server-side IDs).
 * @param {number} id - The render context ID from the server
 * @internal
 */
export function setRenderContextID(id: number): void {
  clientRenderContext.ctxID = id;
}

/**
 * Get the current render context.
 * Returns undefined in browser or if not initialized.
 *
 * @returns {RenderContext} The client-side RenderContext
 */
export const getBrowserRenderContext = (): RenderContext => clientRenderContext;

// Pass the client-side getRenderContext to contract
setInternalContext(getBrowserRenderContext);
