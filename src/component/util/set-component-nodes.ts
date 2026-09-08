import { getAppState } from "../../app-state/app-state.js";
import type { SeidrComponent } from "../types.js";
import { getMarkerComments } from "./get-marker-comments.js";

/**
 * Set root nodes for a component.
 * If the nodes contain more or less than 1 node, marker comments are automatically added.
 *
 * @param {SeidrComponent} instance
 * @param {ChildNode[]} nodes
 */
export function setComponentNodes(instance: SeidrComponent, nodes: ChildNode[]) {
  const appState = getAppState();

  let parentNode: ParentNode | null = null;
  let anchor: ChildNode | null = null;

  // Grab parent node from existing nodes if available
  if (instance.nodes.length > 0) {
    parentNode = instance.nodes[0]?.parentNode;
    anchor = parentNode && instance.nodes.length ? instance.nodes[instance.nodes.length - 1]?.nextSibling : null;

    // Remove existing nodes, and remove bindings from WeakMap
    instance.nodes.forEach((n) => (n.remove(), appState.nodeIndex.delete(n)));
  }

  // Clear out empty nodes
  nodes = nodes.filter(Boolean);

  // Handle marker comments
  if (nodes.length !== 1) {
    const [startMarker, endMarker] = getMarkerComments(instance, true)!;

    if (!nodes.length || nodes[0] !== startMarker) {
      nodes.unshift(startMarker);
    }

    if (!nodes.length || nodes[nodes.length - 1] !== endMarker) {
      nodes.push(endMarker);
    }
  }

  // Assign new nodes
  instance.nodes = nodes;

  // Bind root nodes to component instance (preserving inner child component bindings)
  nodes.forEach((n) => {
    if (!appState.nodeIndex.has(n)) {
      appState.nodeIndex.set(n, instance);
    }
  });

  // Insert nodes if parent exists
  if (parentNode) {
    nodes.forEach((n) => parentNode.insertBefore(n, anchor));
  }
}
