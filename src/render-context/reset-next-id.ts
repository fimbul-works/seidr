import { getRenderContext } from "./render-context";
import { counters } from "./storage";

/**
 * Resets the next available ID for the RenderContext.
 * Used in tests to ensure consistent IDs.
 */
export function resetNextId() {
  try {
    const { ctxID } = getRenderContext();
    counters.delete(ctxID);
  } catch (_e) {
    // Ignore if no render context is available
  }
}
