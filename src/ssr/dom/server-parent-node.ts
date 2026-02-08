import { TYPE_ELEMENT, TYPE_TEXT_NODE } from "../../constants";
import { SeidrError } from "../../types";
import { isEmpty } from "../../util/type-guards/primitive-types";
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
    // 1. Cycle and hierarchy check
    if ((newNode as ServerNode) === parentNode) {
      throw new SeidrError("Cycle detected: cannot insert node into itself");
    }

    if (newNode.contains(parentNode))
      throw new SeidrError("Hierarchy error: cannot insert a node into its own descendant");

    const n = newNode as any;
    // 3. Move from existing parent
    if (n.parentNode) {
      const oldNodes = (n.parentNode.childNodes as any).serverNodes;
      const index = oldNodes.indexOf(n);
      if (index !== -1) oldNodes.splice(index, 1);
    }

    // Determine target parent instance
    const targetParent = parentNode;

    // 4. Update local children list
    if (isEmpty(referenceNode)) {
      const prev = node.childNodes[node.childNodes.length - 1];
      if (prev?.nodeType === TYPE_TEXT_NODE && newNode.nodeType === TYPE_TEXT_NODE) {
        // Merge text: append new content to previous node
        (prev as any).textContent += (newNode as any).textContent;
        // The newNode is effectively "consumed", it doesn't get a new parent and isn't added.
        n.parentNode = null; // Ensure it's detached
      } else {
        n.parentNode = targetParent;
        (node.childNodes as ServerNodeList).nodes.push(n);
      }
    } else {
      const index = (node.childNodes as ServerNodeList).nodes.indexOf(referenceNode as any);
      if (index === -1) {
        throw new SeidrError("The node before which the new node is to be inserted is not a child of this node.");
      }

      const prev = node.childNodes[index - 1];
      if (prev?.nodeType === TYPE_TEXT_NODE && newNode.nodeType === TYPE_TEXT_NODE) {
        // Merge into previous
        (prev as any).textContent += (newNode as any).textContent;
        n.parentNode = null;
        return newNode;
      }

      const next = node.childNodes[index]; // == referenceNode
      if (next?.nodeType === TYPE_TEXT_NODE && newNode.nodeType === TYPE_TEXT_NODE) {
        // Merge into next (prepend)
        (next as any).textContent = (newNode as any).textContent + (next as any).textContent;
        n.parentNode = null;
        return newNode;
      }

      // If no merge happened:
      n.parentNode = targetParent;
      (node.childNodes as ServerNodeList).nodes.splice(index, 0, n);
    }
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
      if (typeof n !== "string") {
        insertRaw(n as ServerNode, null);
      }
    }
  };

  parentNode.prepend = (...nodes: (ServerNode | string)[]) => {
    const reversed = [...nodes].reverse();
    const ref = (node.childNodes as ServerNodeList).serverNodes[0] || null;
    for (const n of reversed) {
      if (typeof n !== "string") {
        insertRaw(n as ServerNode, ref);
      }
    }
  };

  parentNode.replaceChildren = function (...nodes: (ServerNode | string)[]) {
    for (const n of (node.childNodes as ServerNodeList).serverNodes) n.parentNode = null;
    (node.childNodes as ServerNodeList).serverNodes.length = 0;
    this.append(...nodes);
  };

  parentNode.getElementById = (id: string): any | null => {
    for (const n of node.childNodes) {
      if (n.nodeType === TYPE_ELEMENT) {
        if ((n as any).id === id) return n;
        const found = (n as any).getElementById?.(id);
        if (found) return found;
      }
    }
    return null;
  };

  parentNode.getElementsByTagName = function (tagName: string): ServerElement[] {
    return this.querySelectorAll(tagName);
  };

  parentNode.getElementsByClassName = (className: string): ServerElement[] => {
    const results: any[] = [];
    for (const n of (node.childNodes as ServerNodeList).serverNodes) {
      if (n.nodeType === TYPE_ELEMENT) {
        const el = n as ServerElement;
        const classes = el.className?.split(/\s+/) ?? [];
        if (classes.includes(className)) results.push(el);
        results.push(...(el.getElementsByClassName?.(className) || []));
      }
    }
    return results;
  };

  parentNode.querySelector = function (selector: string): ServerElement | null {
    if (selector.startsWith("#")) return this.getElementById(selector.slice(1));
    if (selector.startsWith(".")) return this.getElementsByClassName(selector.slice(1))[0] ?? null;
    for (const n of (node.childNodes as ServerNodeList).serverNodes) {
      if (n.nodeType === TYPE_ELEMENT) {
        const el = n as ServerElement;
        if (el.tagName?.toLowerCase() === selector.toLowerCase()) return el;
        const found = el.querySelector?.(selector);
        if (found) return found;
      }
    }
    return null;
  };

  parentNode.querySelectorAll = function (selector: string): ServerElement[] {
    if (selector.startsWith(".")) return this.getElementsByClassName(selector.slice(1));
    const results: any[] = [];
    for (const n of (node.childNodes as ServerNodeList).serverNodes) {
      if (n.nodeType === TYPE_ELEMENT) {
        const el = n as ServerElement;
        if (el.tagName?.toLowerCase() === selector.toLowerCase()) results.push(el);
        results.push(...(el.querySelectorAll?.(selector) || []));
      }
    }
    return results;
  };

  return parentNode;
}
