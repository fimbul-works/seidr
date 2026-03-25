import { pop, push } from "../component/component-stack";
import { getMarkerComments } from "../component/get-marker-comments";
import type { SeidrChild } from "../element/types";
import { isHydrating } from "../ssr/hydrate/storage";
import { isServer } from "../util/environment/is-server";
import { isComponent } from "../util/type-guards/component-types";
import { isDOMNode, isHTMLElement } from "../util/type-guards/dom-node-types";
import { isArray, isEmpty, isStr } from "../util/type-guards/primitive-types";
import { $text } from "./node/text";

/**
 * Appends a child node to a parent node.
 *
 * @param {Node} parent - The parent node to append the child to
 * @param {SeidrChild | SeidrChild[] | null | undefined} child - The child node to append
 */
export const appendChild = (parent: Node, child: SeidrChild | SeidrChild[] | null | undefined) => {
  // Skip empty children
  if (isEmpty(child) || child === "") {
    return;
  }

  // Append array of nodes
  if (isArray(child)) {
    return child.forEach((c) => appendChild(parent, c));
  }

  const target = parent as ParentNode;

  if (isStr(child) && !child.trim()) {
    return; // Do not append pure whitespace nodes
  }

  // Hydration guard: if the node/component is already in the target, do nothing
  if (!process.env.CORE_DISABLE_SSR && !isServer() && isHydrating()) {
    if (isComponent(child)) {
      // If component is already marked as mounted, we assume it's in the correct place
      // (either from initial reconstruction or previous hydration step)
      if (child.isMounted) {
        return;
      }

      // Check for markers in the target to see if it was already hydrated
      const markers = getMarkerComments(child.id, false);
      if (markers) {
        const [startMarker, endMarker] = markers;
        const hasStart = Array.from(target.childNodes).some((n) => n === startMarker);
        const hasEnd = Array.from(target.childNodes).some((n) => n === endMarker);
        if (hasStart && hasEnd) {
          return;
        }
      }
    } else if (isDOMNode(child)) {
      if (Array.from(target.childNodes).includes(child)) {
        return;
      }
    }
  }

  // Append Seidr component
  if (isComponent(child)) {
    if (child.startMarker) {
      appendChild(parent, child.startMarker);
    }

    if (!process.env.CORE_DISABLE_SSR && isServer()) {
      push(child);
      appendChild(parent, child.element);
      pop();
    } else {
      appendChild(parent, child.element);
    }

    if (child.endMarker) {
      appendChild(parent, child.endMarker);
    }

    if (!child.isMounted) {
      child.mount(parent);
    }

    return;
  }

  const childNode = isDOMNode(child) ? child : $text(child);

  // Final safety check to avoid HierarchyRequestError if childNode is already a parent of target.
  const canContain = isHTMLElement(childNode);
  if (childNode !== target && (!canContain || !childNode.contains(target))) {
    target.appendChild(childNode);
  }
};
