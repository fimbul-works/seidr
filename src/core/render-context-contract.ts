import type { RenderContext } from "./types.js";

/**
 * Cross-environment getRenderContext.
 *
 * @returns {RenderContext | undefined} RenderContext object or undefined.
 */
export let getRenderContext: () => RenderContext | undefined = () => {
  throw new Error("Context not initialized");
};

/**
 * Cross-environment getRenderContext contract dependency injector.
 *
 * @param {(() => RenderContext | undefined)} fn
 */
export const setInternalContext = (fn: () => RenderContext | undefined) => {
  getRenderContext = fn;
};
