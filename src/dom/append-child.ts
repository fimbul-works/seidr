import { getAppState } from "../app-state/app-state.js";
import { onUnmounted } from "../component/lifecycle/on-unmounted.js";
import { isComponent } from "../component/type-guards.js";
import { getMarkerComments } from "../component/util/get-marker-comments.js";
import { TYPE_TEXT_NODE } from "../constants.js";
import { isDOMNode, isHTMLElement } from "../dom/type-guards.js";
import type { SeidrChild } from "../element/types.js";
import { isValue } from "../observable/type-guards.js";
import type { Value } from "../observable/value.js";
import { unwrapValue } from "../observable/unwrap-value.js";
import { isArray, isBool, isNullish, isNum, isStr } from "../util/type-guards.js";
import { isHydrating } from "../ssr/hydrate/storage.js";
import { $text } from "./node/text.js";

/**
 * Normalizes any child or Value output into an array of DOM ChildNodes.
 *
 * @param {any} val - The value to normalize
 * @returns {ChildNode[]} Array of normalized ChildNodes
 */
export const normalizeChildNodes = (val: any): ChildNode[] => {
  if (isNullish(val) || isBool(val) || (isStr(val) && !val.trim())) {
    return [];
  }

  if (isArray(val)) {
    const result: ChildNode[] = [];
    val.forEach((item) => {
      result.push(...normalizeChildNodes(item));
    });
    return result;
  }

  if (isComponent(val)) {
    val.isMounted = true;
    return val.nodes;
  }

  if (isDOMNode(val)) {
    return [val as ChildNode];
  }

  if (isStr(val) || isNum(val)) {
    return [$text(val)];
  }

  return [$text(String(val))];
};

/**
 * Creates reactive value nodes surrounded by start and end marker comments.
 * Automatically tracks and updates the DOM nodes when the Value changes.
 *
 * @param {Value<any>} value - The reactive Value
 * @param {(cleanup: () => void, marker: Comment) => void} onCleanupRegister - Callback to register the cleanup watcher
 * @returns {ChildNode[]} The initial list of nodes, including start and end markers
 */
export const createReactiveValueNodes = (
  value: Value<any>,
  onCleanupRegister: (cleanup: () => void, marker: Comment) => void,
): ChildNode[] => {
  const [startMarker, endMarker] = getMarkerComments(value.id)!;

  const initialNodes = normalizeChildNodes(unwrapValue(value));

  const cleanup = value.watch((newVal) => {
    const parentNode = startMarker.parentNode;
    if (!parentNode) {
      return;
    }

    // Fast-path: Update textContent if single text node
    const firstChild = startMarker.nextSibling;
    if (
      firstChild &&
      firstChild.nextSibling === endMarker &&
      firstChild.nodeType === TYPE_TEXT_NODE &&
      (isStr(newVal) || isNum(newVal)) &&
      String(newVal).trim() !== ""
    ) {
      (firstChild as Text).textContent = String(newVal);
      return;
    }

    // General path: remove old nodes between startMarker and endMarker
    const appState = getAppState();
    let current = startMarker.nextSibling;
    while (current && current !== endMarker) {
      const next = current.nextSibling;
      const comp = appState.nodeIndex.get(current);
      if (comp && !comp.nodes.includes(startMarker) && !comp.nodes.includes(endMarker)) {
        comp.unmount();
      } else {
        current.remove();
      }
      current = next;
    }

    // Insert new nodes before endMarker
    const newNodes = normalizeChildNodes(newVal);
    for (const node of newNodes) {
      parentNode.insertBefore(node, endMarker);
    }
  });

  onCleanupRegister(cleanup, startMarker);

  return [startMarker, ...initialNodes, endMarker];
};

/**
 * Appends a child node to a parent node.
 *
 * @param {Node} parent - The parent node to append the child to
 * @param {SeidrChild | SeidrChild[] | null | undefined} child - The child node to append
 */
export const appendChild = (parent: Node, child: SeidrChild | SeidrChild[] | null | undefined) => {
  // Skip empty children
  if (isNullish(child)) {
    return;
  } else if (isStr(child) && !child.trim()) {
    return; // Do not append pure whitespace nodes
  }

  // Append array of nodes
  if (isArray(child)) {
    return child.forEach((c) => appendChild(parent, c));
  }

  const target = parent as ParentNode;

  // Hydration guard: if the node/component is already in the target, do nothing
  if (!process.env.SEIDR_DISABLE_SSR && isHydrating()) {
    if (isComponent(child)) {
      if (child.isMounted) {
        return;
      }
    } else if (isDOMNode(child) && child.parentNode === parent) {
      return;
    }
  }

  // Append Seidr component
  if (isComponent(child)) {
    child.isMounted = true;
    const [startMarker, endMarker] = getMarkerComments(child, false) || [];
    if (startMarker && !child.nodes.includes(startMarker) && startMarker.parentNode !== parent) {
      appendChild(parent, startMarker);
    }

    appendChild(parent, child.nodes);

    if (endMarker && !child.nodes.includes(endMarker) && endMarker.parentNode !== parent) {
      appendChild(parent, endMarker);
    }

    return;
  } else if (isValue(child)) {
    const nodes = createReactiveValueNodes(child, (cleanup, marker) => {
      if (process.env.VITEST) {
        try {
          onUnmounted(cleanup, marker);
        } catch (error) {
          if (process.env.NODE_ENV === "development") {
            console.error(error);
          }
        }
      } else {
        onUnmounted(cleanup, marker);
      }
    });

    nodes.forEach((node) => {
      if (node.parentNode !== parent) {
        target.appendChild(node);
      }
    });
    return;
  }

  const childNode = isDOMNode(child) ? child : $text(child as string | number);

  // Final safety check to avoid hierarchy request error if childNode is already a parent of target
  if (
    childNode !== parent &&
    childNode.parentNode !== parent &&
    (!isHTMLElement(childNode) || !childNode.contains(parent))
  ) {
    target.appendChild(childNode);
  }
};
