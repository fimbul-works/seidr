import { isArr, isBool, isNullish, isNum, isStr } from "@fimbul-works/hvat";
import { getNodeIndex } from "../component/component-registry.js";
import { isComponent } from "../component/type-guards.js";
import { getMarkerComments } from "../component/util/get-marker-comments.js";
import type { SeidrChild } from "../element/types.js";
import { onUnmounted } from "../hooks/on-unmounted.js";
import { isValue } from "../observable/type-guards.js";
import type { Value } from "../observable/types.js";
import { unwrapValue } from "../observable/unwrap-value.js";
import { isHydrating } from "../ssr/hydrate/storage.js";
import { $text } from "./node/text.js";
import { isCommentNode, isDOMNode, isElementNode, isTextNode } from "./type-guards.js";

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

  if (isArr(val)) {
    return val.flatMap((item) => normalizeChildNodes(item));
  }

  if (isComponent(val)) {
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
 * @param {Value} value - The reactive Value
 * @param {(cleanup: () => void) => void} onCleanupRegister - Callback to register the cleanup watcher
 * @returns {ChildNode[]} The initial list of nodes, including start and end markers
 */
export const createReactiveValueNodes = (
  value: Value,
  onCleanupRegister?: (cleanup: () => void) => void,
): ChildNode[] => {
  const [startMarker, endMarker] = getMarkerComments(value.id)!;

  const unbind = value.watch((newVal) => {
    const parentNode = startMarker.parentNode;
    if (!parentNode) {
      return;
    }

    // Update textContent if single text node
    const firstChild = startMarker.nextSibling;
    if (
      isTextNode(firstChild) &&
      firstChild.nextSibling === endMarker &&
      (isStr(newVal) || isNum(newVal)) &&
      String(newVal).trim() !== ""
    ) {
      firstChild.textContent = String(newVal);
      return () => firstChild.remove();
    }

    // Remove old nodes between startMarker and endMarker
    let current = startMarker.nextSibling;

    while (isDOMNode(current) && current !== endMarker) {
      const next = current.nextSibling;
      const component = getNodeIndex().get(current);
      if (component && !component.nodes.includes(startMarker) && !component.nodes.includes(endMarker)) {
        component.unmount();
      } else {
        current.remove();
      }
      current = next;
    }

    // Insert new nodes before endMarker
    normalizeChildNodes(newVal).forEach((node) => {
      parentNode.insertBefore(node, endMarker);
      if (parentNode.isConnected) {
        mountConnectedComponents(node);
      }
    });

    if (isComponent(newVal) && parentNode.isConnected) {
      newVal.mount();
    }
  });

  const fullCleanup = () => {
    unbind();

    let current = startMarker.nextSibling;
    while (isDOMNode(current) && current !== endMarker) {
      const next = current.nextSibling;
      const comp = getNodeIndex().get(current);
      if (comp && !comp.nodes.includes(startMarker) && !comp.nodes.includes(endMarker)) {
        comp.unmount();
      } else {
        current.remove();
      }
      current = next;
    }
  };

  onCleanupRegister?.(fullCleanup);

  const initialNodes = normalizeChildNodes(unwrapValue(value));
  return [startMarker, ...initialNodes, endMarker];
};

/**
 * Recursively mounts any unmounted components within a DOM subtree.
 *
 * @param {Node} node - Root node to traverse
 */
export const mountConnectedComponents = (node: Node) => {
  if (isCommentNode(node)) {
    return;
  }

  const stack: Node[] = [node];

  while (stack.length > 0) {
    const current = stack.pop()!;
    if (isCommentNode(current)) {
      continue;
    }

    const comp = getNodeIndex().get(current as ChildNode);

    if (comp && !comp.isMounted) {
      // Find top-most unmounted component ancestor to preserve top-down lifecycle
      let rootComp = comp;
      while (rootComp.parent && !rootComp.parent.isMounted) {
        rootComp = rootComp.parent;
      }
      if (rootComp.nodes.every((n) => n.isConnected)) {
        rootComp.mount();
      }
    }

    const childNodes = current.childNodes;
    if (childNodes && childNodes.length > 0) {
      for (let i = childNodes.length - 1; i >= 0; i--) {
        stack.push(childNodes[i]);
      }
    }
  }
};

/**
 * Appends a child node to a parent node.
 *
 * @param {ParentNode} parent - The parent node to append the child to
 * @param {SeidrChild | SeidrChild[] | null | undefined} child - The child node to append
 */
export const appendChild = (parent: ParentNode, child: SeidrChild | SeidrChild[] | null | undefined) => {
  if (child === parent) {
    if (process.env.NODE_ENV !== "production")
      console.log(`Parent and child are the same, skipping append child. ${parent}`);
    return;
  }

  // Skip empty children
  if (isNullish(child)) {
    return;
  } else if (isStr(child) && !child.trim()) {
    return; // Do not append pure whitespace nodes
  }

  // Append array of nodes
  if (isArr(child)) {
    return child.forEach((c) => appendChild(parent, c));
  }

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
    const [startMarker, endMarker] = getMarkerComments(child, false) || [];

    if (startMarker && !child.nodes.includes(startMarker) && startMarker.parentNode !== parent) {
      appendChild(parent, startMarker);
    }

    appendChild(parent, child.nodes);

    if (endMarker && !child.nodes.includes(endMarker) && endMarker.parentNode !== parent) {
      appendChild(parent, endMarker);
    }

    if (parent.isConnected) {
      child.mount();
    }
  } else if (isValue(child)) {
    const nodes = createReactiveValueNodes(child, (cleanup) => {
      if (process.env.VITEST) {
        try {
          onUnmounted(cleanup);
        } catch (error) {
          if (process.env.NODE_ENV !== "production") {
            console.error(error);
          }
        }
      } else {
        onUnmounted(cleanup);
      }
    });

    nodes.forEach((node) => node.parentNode !== parent && parent.appendChild(node));
  } else {
    const childNode = isDOMNode(child) ? child : $text(child);

    // Avoid hierarchy request error if childNode is already a parent of target
    if (!isElementNode(childNode) || !childNode.contains(parent)) {
      parent.appendChild(childNode);

      if (parent.isConnected) {
        mountConnectedComponents(childNode);
      }
    }
  }
};
