import type { SeidrComponent } from "../../component/types.js";
import { SeidrError } from "../../types.js";
import type { RouterTreeNode } from "../types.js";
import { getNearestRouter } from "./get-nearest-router.js";
import { getRouterTree } from "./get-router-tree.js";
import { unregisterRouter } from "./unregister-router.js";

/**
 * Register a router tree node for the given component scope.
 *
 * @param {SeidrComponent} component - The component scope to register the router for
 * @param {RouterTreeNode} node - The router tree node to register
 * @returns {RouterTreeNode} The registered router tree node
 * @throws {SeidrError} If a router is already registered for the given component scope
 */
export const registerRouter = (component: SeidrComponent, node: RouterTreeNode): RouterTreeNode => {
  const tree = getRouterTree();

  // Check existing router for the current scope
  if (tree.has(component.id)) {
    throw new SeidrError(`Router with ID ${component.id} is already registered`);
  }

  // Unregister the router when the component is unmounted
  component.onUnmount(() => unregisterRouter(component.id));

  // Set parent-child relationship if there is a parent router
  const parent = getNearestRouter(component);
  if (parent) {
    node.parentId = parent.component.id;
    parent.childrenIds.add(component.id);
  }

  tree.set(component.id, node);
  return node;
};
