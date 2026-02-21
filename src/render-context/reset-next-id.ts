import { getRenderContext } from "./render-context";

/**
 * Resets the next available ID for the RenderContext.
 * Used in tests to ensure consistent IDs.
 */
export const resetNextId = (): void => {
  try {
    getRenderContext().idCounter = 0;
  } catch (_e) {
    // Ignore if no render context is available
  }
};
