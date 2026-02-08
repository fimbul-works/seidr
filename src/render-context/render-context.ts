import { renderContext } from "./storage";
import type { RenderContext } from "./types";

/**
 * Get the current render context.
 *
 * @returns {RenderContext} RenderContext object.
 */
export let getRenderContext = (): RenderContext => renderContext;

/**
 * Cross-environment getRenderContext contract dependency injector.
 *
 * @param {(() => RenderContext)} fn
 * @internal
 */
export function setInternalContext(fn: () => RenderContext) {
  getRenderContext = fn;
}

/**
 * Set the render context ID (used during hydration to match server-side IDs).
 * @param {number} id - The render context ID from the server
 * @internal
 */
export function setRenderContextID(id: number): void {
  getRenderContext().ctxID = id;
}
