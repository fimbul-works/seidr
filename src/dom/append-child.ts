import type { SeidrChild } from "../element/types";
import type { CleanupFunction } from "../types";
import { isDOMNode } from "../util/type-guards/dom-node-types";
import { isArray } from "../util/type-guards/primitive-types";
import { isSeidrComponent } from "../util/type-guards/seidr-dom-types";
import { $text } from "./text";

/**
 * Appends a child node to a parent node.
 *
 * @param {Node} parent - The parent node to append the child to
 * @param {SeidrChild | SeidrChild[] | null | undefined} child - The child node to append
 * @param {CleanupFunction[]} [cleanups=[]] - Array to push cleanup functions to
 */
export function appendChild(
  parent: Node,
  child: SeidrChild | SeidrChild[] | null | undefined,
  cleanups: CleanupFunction[] = [],
) {
  // Skip empty children
  if (!child) {
    return;
  }

  // Append array of nodes
  if (isArray(child)) {
    return child.forEach((c) => appendChild(parent, c));
  }

  // Append Seidr component
  if (isSeidrComponent(child)) {
    // Add start marker comment
    if (child.startMarker) {
      parent.appendChild(child.startMarker);
    }

    appendChild(parent, child.element);

    // Add end marker comment
    if (child.endMarker) {
      parent.appendChild(child.endMarker);
    }

    // Invoke attached callback
    child.scope.attached(parent);
    return cleanups.push(() => child.unmount());
  }

  // Append DOM node or text node
  parent.appendChild(isDOMNode(child) ? child : $text(child));
}
