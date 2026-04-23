import { getMarkerComments } from "../component/get-marker-comments.js";
import { setScope } from "../component/set-scope.js";
import { useScope } from "../component/use-scope.js";
import type { SeidrChild } from "../element/types.js";
import type { Seidr } from "../seidr/seidr.js";
import { unwrapSeidr } from "../seidr/unwrap-seidr.js";
import { isHydrating } from "../ssr/hydrate/storage.js";
import { isServer } from "../util/environment/is-server.js";
import { some } from "../util/some.js";
import { isComponent } from "../util/type-guards/component-types.js";
import { isDOMNode, isHTMLElement } from "../util/type-guards/dom-node-types.js";
import { isSeidr } from "../util/type-guards/observable-types.js";
import { isArray, isEmpty, isStr } from "../util/type-guards/primitive-types.js";
import { $text } from "./node/text.js";

/**
 * Appends a child node to a parent node.
 *
 * @param {Node} parent - The parent node to append the child to
 * @param {SeidrChild | SeidrChild[] | null | undefined} child - The child node to append
 */
export const appendChild = (parent: Node, child: SeidrChild | SeidrChild[] | null | undefined) => {
  // Skip empty children
  if (isEmpty(child)) {
    return;
  } else if (isStr(child) && !child.trim()) {
    return; // Do not append pure whitespace nodes
  }

  // Append array of nodes
  if (isArray(child)) {
    return child.forEach((c) => appendChild(parent, c));
  }

  const target = parent as ParentNode;
  const childNodes = target.childNodes;

  const appendReactiveTextNode = (c: Seidr<string>) => {
    const childNode = $text(unwrapSeidr(c));
    const cleanup = c.observe((text) => (childNode.textContent = text));
    if (process.env.VITEST) {
      try {
        useScope().onUnmount(cleanup);
      } catch (error) {
        // @ts-expect-error
        if (__SEIDR_DEV__) {
          console.error(error);
        }
      } finally {
        target.appendChild(childNode);
      }
    } else {
      useScope().onUnmount(cleanup);
      target.appendChild(childNode);
    }
  };

  // Hydration guard: if the node/component is already in the target, do nothing
  if (!process.env.SEIDR_DISABLE_SSR && isHydrating()) {
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
        const hasStart = some(childNodes, (n) => n === startMarker);
        const hasEnd = some(childNodes, (n) => n === endMarker);
        if (hasStart && hasEnd) {
          return;
        }
      }
    } else if (isDOMNode(child) && some(childNodes, (n) => n === child)) {
      return;
    } else if (isSeidr(child)) {
      appendReactiveTextNode(child);
      return;
    }
  }

  // Append Seidr component
  if (isComponent(child)) {
    if (child.startMarker) {
      appendChild(parent, child.startMarker);
    }

    if (!process.env.SEIDR_DISABLE_SSR && isServer()) {
      setScope(child);
      appendChild(parent, child.element);
      setScope(child.parent);
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
  } else if (isSeidr(child)) {
    appendReactiveTextNode(child);
    return;
  }

  const childNode = isDOMNode(child) ? child : $text(child);

  // Final safety check to avoid hierarchy request error if childNode is already a parent of target
  if (childNode !== target && (!isHTMLElement(childNode) || !childNode.contains(target))) {
    target.appendChild(childNode);
  }
};
