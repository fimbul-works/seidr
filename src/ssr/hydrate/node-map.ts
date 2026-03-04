/**
 * Global map storing the relationship between client-created virtual nodes
 * and their corresponding hydrated server-side DOM nodes.
 * Used to route reactive updates to the actual elements in the DOM.
 */
export const hydrationMap = new WeakMap<Node, Node>();
