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
  const rawId = isHTMLElement(node) ? node.dataset.seidrId : isComment(node) ? node.textContent?.split(":").pop() : "";

  if (!rawId) {
    return null;
  }

  const parentNumeric = parentComponentId.split("-").pop() || "";
  const ids = rawId.split(" ");

  // Find a candidate ID that represents a child component (not the parent)
  // We prefer the last one added as it's the most specific/recent component.
  for (let i = ids.length - 1; i >= 0; i--) {
    const id = ids[i].trim();
    if (!id) continue;

    const idNumeric = id.split("-").pop();

    // If it's the parent's ID, it's not a child boundary entry for the parent's map
    if (idNumeric === parentNumeric || id === parentComponentId) {
      continue;
    }

    // Return the specific component ID
    return /\d+/.test(id) ? id : null;
  }

  return null;
}
