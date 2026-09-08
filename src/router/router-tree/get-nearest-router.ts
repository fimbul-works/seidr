import { getComponentScope } from "../../component/lifecycle/component-scope.js";
import type { SeidrComponent } from "../../component/types.js";
import { getRouterState } from "../get-router-state.js";
import type { RouterTreeNode } from "../types.js";
import { getRouterTree } from "./get-router-tree.js";

/**
 * Get the nearest router tree node for the current component scope.
 *
 * @param {SeidrComponent | null} [component] - The component scope to get the parent router for, default: `getComponentScope()`
 * @returns {RouterTreeNode | null} The router tree node, or null
 * @throws {SeidrError} If the router is not initialized
 */
export const getNearestRouter = (component?: SeidrComponent | null): RouterTreeNode | null => {
  if (!component) {
    if (process.env.VITEST) {
      try {
        component = getComponentScope();
      } catch {
        return null;
      }
    } else {
      component = getComponentScope();
    }
  }

  if (!component) {
    return null;
  }

  const state = getRouterState();

  // Check if the parent router is already cached for the current scope
  const parentMap = state.parentMap;
  if (parentMap.has(component.id)) {
    return parentMap.get(component.id)!;
  }

  // Get the router tree and the set of registered router IDs
  const tree = getRouterTree();
  const ids = new Set<number>(tree.keys());

  // Traverse up the component tree until we find a router or reach the root
  let parent: SeidrComponent | null = component.owner;
  while (parent !== null && !ids.has(parent.id)) {
    parent = parent.owner;
  }

  // Cache the parent router for the current scope
  const node = parent ? tree.get(parent.id)! : null;
  parentMap.set(component.id, node);
  component.onUnmount(() => parentMap.delete(component.id));

  return node;
};
