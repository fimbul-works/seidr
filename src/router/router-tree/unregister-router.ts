import { getAppState } from "../../app-state/app-state.js";
import { DATA_KEY_ROUTER } from "../constants.js";
import { getRouterTree } from "./get-router-tree.js";

/**
 * Unregister a router tree node for the given component ID.
 *
 * @param {number} id - The router component ID to unregister
 */
export const unregisterRouter = (id: number): void => {
  const appState = getAppState();
  if (!appState.hasData(DATA_KEY_ROUTER)) {
    return;
  }

  const tree = getRouterTree();

  // Check existing router for the current scope
  if (!tree.has(id)) {
    return;
  }

  const router = tree.get(id)!;

  // Recursively unregister child routers
  if (router.childrenIds.size > 0) {
    router.childrenIds.forEach((childId) => unregisterRouter(childId));
    router.childrenIds.clear();
  }

  // Remove parent-child relationship if there is a parent router
  if (router.parentId !== undefined) {
    const parent = tree.get(router.parentId);
    if (parent) {
      parent.childrenIds.delete(id);
    }
  }

  tree.delete(id);
};
