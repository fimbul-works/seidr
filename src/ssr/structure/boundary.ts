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
  const numericPart = parentComponentId.split("-")[1];
  const id = isHTMLElement(node)
    ? node.dataset.seidrId
    : isComment(node)
      ? node.data.split("-").pop()
      : "";
  if (Number.isNaN(parseInt(id || "", 10))) {
    return null;
  }
  return numericPart === id ? null : (id as string);
}
