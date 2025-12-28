import { setInternalContext } from "./core/render-context-contract";
import type { RenderContext } from "./core/types";

/** @type {RenderContext} Client-side render context */
const clientRenderContext: RenderContext = { renderContextID: 0, idCounter: 0 };

/**
 * Get the current render context.
 * Returns undefined in browser or if not initialized.
 *
 * @returns {RenderContext} The client-side RenderContext
 */
export const getRenderContext = () => clientRenderContext;

// Pass the client-side getRenderContext to contract
setInternalContext(getRenderContext);
