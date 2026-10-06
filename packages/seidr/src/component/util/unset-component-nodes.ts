import { getAppState } from "../../app-state/app-state.js";
import type { SeidrComponent } from "../types.js";

/**
 * Set root nodes for a component.
 * If the nodes contain more or less than 1 node, marker comments are automatically added.
 *
 * @param {SeidrComponent} instance
 * @param {ChildNode[]} nodes
 */
export function unsetComponentNodes(currentComponent: SeidrComponent) {
  const appState = getAppState();
  currentComponent.nodes.forEach((n) => (n.remove(), appState.nodeIndex.delete(n)));
}
