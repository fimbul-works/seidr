import { scopes } from "./storage";

/**
 * Removes the SSR scope for a specific render context ID.
 * Called after rendering to prevent memory leaks.
 *
 * @param {number} ctxID - The render context ID to clear
 */
export function clearSSRScope(ctxID: number): void {
  scopes.delete(ctxID);
}
