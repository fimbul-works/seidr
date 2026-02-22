/**
 * Global map storing the relationship between client-created virtual nodes
 * and their corresponding hydrated server-side DOM nodes.
 * Used to route reactive updates to the actual elements in the DOM.
 */
export const hydrationMap = new WeakMap<Node, Node>();

export interface HydrationTarget extends Node {
  /** Tracks the index of the child currently being hydrated. */
  __hydration_index?: number;
}

/**
 * Checks if a node is actively participating in SSR hydration.
 */
export const isHydrationTarget = (node: Node): node is HydrationTarget =>
  (node as HydrationTarget).__hydration_index !== undefined;
