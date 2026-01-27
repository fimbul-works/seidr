import type { RenderContext } from "../types";

/**
 * Cross-environment getRenderContext.
 *
 * @returns {RenderContext} RenderContext object.
 */
export let getRenderContext: () => RenderContext = (): RenderContext => {
  throw new Error("RenderContext not initialized");
};

/**
 * Cross-environment getRenderContext contract dependency injector.
 *
 * @param {(() => RenderContext)} fn
 */
export function setInternalContext(fn: () => RenderContext) {
  getRenderContext = fn;
}
