import { getRenderContext } from "./render-context";

/**
 * Gets the next available ID for the RenderContext.
 * @returns {number} The next available ID
 */
export const getNextId = (): number => getRenderContext().idCounter++ + 1;
