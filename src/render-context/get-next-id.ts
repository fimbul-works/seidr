import { getRenderContext } from "./render-context";

/**
 * Gets the next available Seidr ID for the RenderContext.
 * @returns {number} The next available Seidr ID
 */
export const getNextSeidrId = (): number => getRenderContext().sID++ + 1;

/**
 * Gets the next available component ID for the RenderContext.
 * @returns {number} The next available component ID
 */
export const getNextComponentId = (): number => getRenderContext().cID++ + 1;
