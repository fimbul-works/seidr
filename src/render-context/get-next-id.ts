import { getRenderContext } from "./render-context";
import { counters } from "./storage";

/**
 * Gets the next available ID for the RenderContext.
 * @returns {number} The next available ID
 */
export function getNextId(): number {
  const { ctxID } = getRenderContext();
  const id = (counters.get(ctxID) ?? 0) + 1;
  counters.set(ctxID, id);
  return id;
}
