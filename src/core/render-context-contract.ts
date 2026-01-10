import type { RenderContext } from "./types";

/**
 * Cross-environment getRenderContext.
 *
 * @returns {RenderContext | undefined} RenderContext object or undefined.
 */
export let getRenderContext: () => RenderContext | undefined = (): RenderContext | undefined => {
  if (typeof process !== "undefined" && process.env.CLIENT_BUNDLE) return undefined;
  throw new Error("Context not initialized");
};

/**
 * Cross-environment getRenderContext contract dependency injector.
 *
 * @param {(() => RenderContext | undefined)} fn
 */
export function setInternalContext(fn: () => RenderContext | undefined) {
  getRenderContext = fn;
}
