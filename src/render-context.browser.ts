import { setInternalContext } from "./core/render-context-contract.js";
import type { RenderContext } from "./core/types.js";

/** @type {RenderContext} Client-side render context */
let clientRenderContext: RenderContext = { renderContextID: 0, idCounter: 0 };

/**
 * Get the current render context.
 * Returns undefined in browser or if not initialized.
 *
 * @returns {RenderContext} The client-side RenderContext
 */
export const getRenderContext = () => clientRenderContext;

// Pass the client-side getRenderContext to contract
setInternalContext(getRenderContext);

/**
 * Set the current RenderContext to another by ID.
 * This resets the idCounter to 0.
 *
 * @param {number} renderContextID - New RenderContext iD
 */
export const setClientRenderContext = (renderContextID: number) => {
  clientRenderContext = { renderContextID, idCounter: 0 };
};
