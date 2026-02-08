import { globalStates } from "../../state/storage";

/**
 * Clear all States for a render context.
 * This fucntion should be called at the end of a SSR request.
 *
 * @param {number} ctxID - Render context ID
 * @returns {boolean} `true` if the renderScopeState existed, `false` otherwise
 */
export const clearGlobalState = (ctxID: number) => globalStates.delete(ctxID);
