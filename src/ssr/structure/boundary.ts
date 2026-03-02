import { isComment, isHTMLElement } from "../../util/type-guards/dom-node-types";

/**
 * Checks a node to see if it's the boundary marker for a child component.
 * If it is a boundary, returns the boundary's ID (e.g. 'componentID' or 'componentID.index').
 * If it belongs to the current component, returns null.
 *
 * @param node The DOM node to check
 * @param parentComponentId The ID of the component we are currently collecting data for
 */
export function getComponentBoundaryId(node: Node, parentComponentId: string): string | null {
  const id = isHTMLElement(node)
    ? node.dataset.seidrId
    : isComment(node)
      ? node.textContent?.split(":").pop()?.split("-").pop()
      : "";

  if (!id) {
    return null;
  }

  // If the ID is not a number, it's not a valid component boundary.
  if (Number.isNaN(parseInt(id, 10))) {
    return null;
  }

  // If the ID from the node is a full ID (e.g., "component-1-0"), check if it starts with the parent ID.
  // If it's just a numeric part (e.g., "0"), compare it to the parent's numeric part.
  if (id.startsWith(parentComponentId)) {
    return null; // This node belongs to the current component or is its own boundary
  }

  const parentNumeric = parentComponentId.split("-").pop();
  const idNumeric = id.split("-").pop(); // Get numeric part if it's a full ID, or just the ID if it's already numeric

  // If the numeric parts match, it's part of the current component.
  // This handles cases where `id` might just be the numeric part (e.g., from a comment marker).
  if (parentNumeric === idNumeric) {
    return null;
  }

  // If we reach here, it's a boundary for a different component.
  // Return the full ID if available, otherwise the numeric part.
  return id;
}
