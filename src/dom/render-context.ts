import type { RenderContext } from "./ssr/render-context.js";

/** Lazy-loaded SSR module */
let ssrModule: any;

/**
 * Get the current render context.
 * Returns undefined in browser or if not initialized.
 */
export const getRenderContext = (): RenderContext | undefined => {
  // Always undefined in he browser
  if (typeof window !== "undefined" && (typeof process === "undefined" || process.env.SEIDR_TEST_SSR)) {
    return undefined;
  }

  // Lazy-load the SSR module
  if (!ssrModule) {
    try {
      ssrModule = require("./dom/ssr/render-context.js");
    } catch (_) {
      return undefined;
    }
  }

  return ssrModule?.getRenderContext();
};
