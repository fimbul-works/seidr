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
export const setRenderContextID = (id: number) => {
  const ctx = getRenderContext();
  ctx.ctxID = id;
  ctx.sID = 0;
  ctx.cID = 0;
  ctx.featureData.clear();
  ctx.markers.clear();
};

/**
 * Get the current render context ID.
 *
 * @returns {number} The render context ID.
 */
export const getRenderContextID = () => getRenderContext().ctxID;
