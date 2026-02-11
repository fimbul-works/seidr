import { getRenderContext } from "./render-context";
import { counters } from "./storage";

/**
 * Resets the next available ID for the RenderContext.
 * Used in tests to ensure consistent IDs.
 */
export const resetNextId = (): void => {
  try {
    counters.delete(getRenderContext().ctxID);
  } catch (_e) {
    // Ignore if no render context is available
  }
};
