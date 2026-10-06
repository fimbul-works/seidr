import { getRouterState } from "../get-router-state.js";
import type { RouterTreeNode } from "../types.js";

/**
 * Get the current router tree.
 *
 * @returns {Map<number, RouterTreeNode>} The router tree
 * @throws {SeidrError} If the router is not initialized
 */
export const getRouterTree = (): Map<number, RouterTreeNode> => getRouterState().tree;
