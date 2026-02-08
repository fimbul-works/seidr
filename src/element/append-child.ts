import type { SeidrComponentChildren } from "../component";
import { $text } from "../dom/text";
import type { CleanupFunction } from "../types";
import { isDOMNode } from "../util/type-guards/dom-node-types";
import { isArray, isStr } from "../util/type-guards/primitive-types";
import { isSeidrComponent } from "../util/type-guards/seidr-dom-types";

/**
 * Appends a child node to a parent node.
 *
 * @param {Node} parent - The parent node to append the child to
 * @param {SeidrNode} child - The child node to append
 * @param {CleanupFunction[]} [cleanups=[]] - Array to push cleanup functions to
 */
export function appendChild(parent: Node, child: SeidrComponentChildren, cleanups: CleanupFunction[] = []) {
  if (!child) {
    return;
  }

  if (isStr(child)) {
    parent.appendChild($text(child));
    return;
  }

  if (isArray(child)) {
    child.forEach((c) => appendChild(parent, c));
    return;
  }

  if (isSeidrComponent(child)) {
    if (child.start) {
      parent.appendChild(child.start);
    }

    const el = child.element;
    if (isArray(el)) {
      el.forEach((node) => {
        if (isDOMNode(node) && node !== child.start && node !== child.end) {
          parent.appendChild(node);
        }
      });
    } else if (isDOMNode(el)) {
      if (el !== child.start && el !== child.end) {
        parent.appendChild(el);
      }
    }

    if (child.end) {
      parent.appendChild(child.end);
    }

    return cleanups.push(() => child.unmount());
  }

  parent.appendChild(isDOMNode(child) ? child : $text(child));
}
