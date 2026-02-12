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
export const setInternalRenderContext = (fn: () => RenderContext) => (getRenderContext = fn);

/**
 * Set the render context ID (used during hydration to match server-side IDs).
 * @param {number} id - The render context ID from the server
 * @internal
 */
export const setRenderContextID = (id: number) => (getRenderContext().ctxID = id);

/**
 * Get the current render context ID.
 *
 * @returns {number} The render context ID.
 */
export const getRenderContextID = () => getRenderContext().ctxID;
