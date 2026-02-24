import { TYPE_ELEMENT, TYPE_TEXT_NODE } from "../../constants";
import { SeidrError } from "../../types";
import { isStr } from "../../util/type-guards/primitive-types";
import type { ServerNodeList } from "./server-node-list";
import type { ServerElement, ServerNode, ServerParentNode } from "./types";

/**
 * Enhances a node with ParentNode-like methods and properties.
 *
 * @param {T} node - The node to enhance
 * @returns {T & ServerParentNode} The enhanced node
 */
export function applyParentNodeMethods<T extends ServerNode>(node: T): T & ServerParentNode {
  const parentNode = node as T & ServerParentNode;

  Object.defineProperties(parentNode, {
    firstChild: {
      get: () => node.childNodes[0] ?? null,
      enumerable: true,
    },
    lastChild: {
      get: () => node.childNodes[node.childNodes.length - 1] ?? null,
      enumerable: true,
    },
    childElementCount: {
      get: () => parentNode.children.length,
      enumerable: true,
    },
    children: {
      get: () => (node.childNodes as ServerNodeList).nodes.filter((n: any) => n.nodeType === TYPE_ELEMENT),
      enumerable: true,
    },
  });

  // Internal raw insertion logic that doesn't call public methods
  const insertRaw = <U extends ServerNode = ServerNode>(newNode: U, ref: ServerNode | null | undefined): U => {
    const referenceNode = ref === undefined ? null : ref;

    if (referenceNode) {
      // console.log("insertRaw", newNode.id ?? newNode.tagName ?? newNode.textContent, referenceNode.id ?? referenceNode.tagName);
    }

    // 1. Cycle and hierarchy check
    if ((newNode as ServerNode) === parentNode) {
      throw new SeidrError("Cycle detected: cannot insert node into itself");
    }

    if (newNode.contains(parentNode)) {
      throw new SeidrError("Hierarchy error: cannot insert a node into its own descendant");
    }

    // Remove from existing parent
    if (newNode.parentNode) {
      const oldNodes = (newNode.parentNode.childNodes as ServerNodeList).serverNodes;
      const index = oldNodes.indexOf(newNode);
      if (index !== -1) {
        oldNodes.splice(index, 1);
      }
    }

    // Update local children list
    if (!referenceNode) {
      const prev = node.childNodes[node.childNodes.length - 1];
      if (prev?.nodeType === TYPE_TEXT_NODE && newNode.nodeType === TYPE_TEXT_NODE) {
        // Merge text
        (prev as Text).data += (newNode as unknown as Text).data;
        // The newNode is effectively "consumed", it doesn't get a new parent and isn't added.
        newNode.parentNode = null; // Ensure it's detached
      } else {
        newNode.parentNode = parentNode;
        (node.childNodes as ServerNodeList).serverNodes.push(newNode);
      }
      return newNode;
    }

    const index = (node.childNodes as ServerNodeList).serverNodes.indexOf(referenceNode);
    if (index === -1) {
      throw new SeidrError("The node before which the new node is to be inserted is not a child of this node.");
    }

    const prev = node.childNodes[index - 1];
    if (prev?.nodeType === TYPE_TEXT_NODE && newNode.nodeType === TYPE_TEXT_NODE) {
      // Merge text
      (prev as Text).data += (newNode as unknown as Text).data;
      newNode.parentNode = null;
      return newNode;
    }

    const next = node.childNodes[index]; // == referenceNode
    if (next?.nodeType === TYPE_TEXT_NODE && newNode.nodeType === TYPE_TEXT_NODE) {
      // Merge text
      (next as Text).data = (newNode as unknown as Text).data + (next as unknown as Text).data;
      newNode.parentNode = null;
      return newNode;
    }

    // If no merge happened:
    newNode.parentNode = parentNode;
    (node.childNodes as ServerNodeList).serverNodes.splice(index, 0, newNode);

    return newNode;
  };

  parentNode.insertBefore = <U extends ServerNode>(newNode: U, referenceNode: ServerNode | null): U =>
    insertRaw(newNode, referenceNode);

  parentNode.appendChild = <U extends ServerNode>(child: U): U => insertRaw(child, null);

  parentNode.removeChild = <U extends ServerNode>(child: U): U => {
    const index = (node.childNodes as ServerNodeList).nodes.indexOf(child as any);
    if (index === -1) {
      throw new SeidrError("The node to be removed is not a child of this node.");
    }
    (node.childNodes as ServerNodeList).nodes.splice(index, 1);
    (child as any).parentNode = null;
    return child;
  };

  parentNode.append = (...nodes: (ServerNode | string)[]) => {
    for (const n of nodes) {
      if (!isStr(n)) {
        insertRaw(n as ServerNode, null);
      }
    }
  };

  parentNode.prepend = (...nodes: (ServerNode | string)[]) => {
    const reversed = [...nodes].reverse();
    const ref = (node.childNodes as ServerNodeList).serverNodes[0] || null;
    for (const n of reversed) {
      if (!isStr(n)) {
        insertRaw(n as ServerNode, ref);
      }
    }
  };

  parentNode.replaceChildren = function (...nodes: (ServerNode | string)[]) {
    for (const n of (node.childNodes as ServerNodeList).serverNodes) n.parentNode = null;
    (node.childNodes as ServerNodeList).serverNodes.length = 0;
    this.append(...nodes);
  };

  parentNode.getElementById = (id: string): ServerElement | null => {
    const children = parentNode.children as ServerElement[];
    for (const el of children) {
      if (el.id === id) {
        return el;
      }

      const found = el.getElementById?.(id);
      if (found) {
        return found;
      }
    }

    return null;
  };

  parentNode.getElementsByTagName = function (tagName: string): ServerElement[] {
    return this.querySelectorAll(tagName);
  };

  parentNode.getElementsByClassName = (className: string): ServerElement[] => {
    const results: ServerElement[] = [];

    const children = parentNode.children as ServerElement[];
    for (const el of children) {
      const classes = el.className?.split(/\s+/) ?? [];

      if (classes.includes(className)) {
        results.push(el);
      }

      results.push(...(el.getElementsByClassName?.(className) || []));
    }

    return results;
  };

  parentNode.querySelector = (selector: string): ServerElement | null => {
    const children = parentNode.children as ServerElement[];
    for (const el of children) {
      if (el.matches(selector)) {
        return el;
      }

      const found = el.querySelector?.(selector);
      if (found) {
        return found;
      }
    }
    return null;
  };

  parentNode.querySelectorAll = (selector: string): ServerElement[] => {
    const results: ServerElement[] = [];
    const children = parentNode.children as ServerElement[];
    for (const el of children) {
      if (el.matches(selector)) {
        results.push(el);
      }

      results.push(...(el.querySelectorAll?.(selector) || []));
    }

    return results;
  };

  return parentNode;
}
