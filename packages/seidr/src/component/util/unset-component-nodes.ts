import { getNodeIndex } from "../component-registry.js";
import type { SeidrComponent } from "../types.js";

/**
 * Set root nodes for a component.
 * If the nodes contain more or less than 1 node, marker comments are automatically added.
 *
 * @param {SeidrComponent} instance
 * @param {ChildNode[]} nodes
 */
export const unsetComponentNodes = (currentComponent: SeidrComponent) =>
  currentComponent.nodes.forEach((n) => (n.remove(), getNodeIndex().delete(n)));
