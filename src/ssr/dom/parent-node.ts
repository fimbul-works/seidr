import { DOCUMENT_FRAGMENT_NODE, ELEMENT_NODE, TEXT_NODE } from "../../types";
import type { ServerElement } from "./element";
import type { InternalServerNode } from "./node";
import type { ServerNode, ServerParentNode } from "./types";

/**
 * Enhances a node with ParentNode-like methods and properties.
 *
 * @param {T} node - The node to enhance
 * @returns {T & ServerParentNode} The enhanced node
 */
export function applyParentNodeMethods<T extends InternalServerNode & ServerNode>(node: T): T & ServerParentNode {
  const _nodes = node._childNodes;

  const augmented = node as T & ServerParentNode;

  Object.defineProperties(augmented, {
    firstChild: {
      get: () => _nodes[0] ?? null,
      enumerable: true,
    },
    lastChild: {
      get: () => _nodes[_nodes.length - 1] ?? null,
      enumerable: true,
    },
    childElementCount: {
      get: () => augmented.children.length,
      enumerable: true,
    },
    children: {
      get: () => _nodes.filter((n: any) => n.nodeType === ELEMENT_NODE),
      enumerable: true,
    },
  });

  // Internal raw insertion logic that doesn't call public methods
  const insertRaw = <U extends ServerNode>(newNode: U, ref: ServerNode | null | undefined): U => {
    const referenceNode = ref === undefined ? null : ref;
    // 1. Cycle and hierarchy check
    if ((newNode as any) === augmented) throw new Error("Cycle detected: cannot insert node into itself");
    if (newNode.contains(augmented)) throw new Error("Hierarchy error: cannot insert a node into its own descendant");

    // 2. Fragment flattening
    if (newNode.nodeType === DOCUMENT_FRAGMENT_NODE) {
      // DOCUMENT_FRAGMENT_NODE
      for (const child of [...newNode.childNodes]) {
        insertRaw(child as unknown as ServerNode, referenceNode);
      }

      // Note: Standard DOM behavior is that the fragment itself is now empty
      (newNode as any)._childNodes.length = 0;
      return newNode;
    }

    const n = newNode as any;
    // 3. Move from existing parent
    if (n._parentNode) {
      const oldNodes = n._parentNode._childNodes;
      const index = oldNodes.indexOf(n);
      if (index !== -1) oldNodes.splice(index, 1);
    }

    // Determine target parent instance (Proxy if available, else augmented)
    const targetParent = (augmented as any)._proxy || augmented;

    // 4. Update local children list
    if (referenceNode === null) {
      const prev = _nodes[_nodes.length - 1];
      if (prev && prev.nodeType === TEXT_NODE && newNode.nodeType === TEXT_NODE) {
        // Merge text: append new content to previous node
        (prev as any).textContent += (newNode as any).textContent;
        // The newNode is effectively "consumed", it doesn't get a new parent and isn't added.
        n._parentNode = null; // Ensure it's detached
      } else {
        n._parentNode = targetParent;
        _nodes.push(n);
      }
    } else {
      const index = _nodes.indexOf(referenceNode as any);
      if (index === -1) {
        throw new Error("The node before which the new node is to be inserted is not a child of this node.");
      }

      const prev = _nodes[index - 1];
      // Check previous sibling
      if (prev && prev.nodeType === TEXT_NODE && newNode.nodeType === TEXT_NODE) {
         // Merge into previous
         (prev as any).textContent += (newNode as any).textContent;
         n._parentNode = null;
         return newNode;
      }

      const next = _nodes[index]; // == referenceNode
      if (next.nodeType === TEXT_NODE && newNode.nodeType === TEXT_NODE) {
         // Merge into next (prepend)
          (next as any).textContent = (newNode as any).textContent + (next as any).textContent;
          n._parentNode = null;
          return newNode;
      }

      // If no merge happened:
      n._parentNode = targetParent;
      _nodes.splice(index, 0, n);
    }
    return newNode;
  };

  augmented.insertBefore = <U extends ServerNode>(newNode: U, referenceNode: ServerNode | null): U =>
    insertRaw(newNode, referenceNode);

  augmented.appendChild = <U extends ServerNode>(child: U): U => insertRaw(child, null);

  augmented.removeChild = <U extends ServerNode>(child: U): U => {
    const index = _nodes.indexOf(child as any);
    if (index === -1) {
      throw new Error("The node to be removed is not a child of this node.");
    }
    _nodes.splice(index, 1);
    (child as any)._parentNode = null;
    return child;
  };

  augmented.append = (...nodes: (ServerNode | string)[]) => {
    for (const n of nodes) {
      if (typeof n !== "string") {
        insertRaw(n as ServerNode, null);
      }
    }
  };

  augmented.prepend = (...nodes: (ServerNode | string)[]) => {
    const reversed = [...nodes].reverse();
    const ref = _nodes[0] || null;
    for (const n of reversed) {
      if (typeof n !== "string") {
        insertRaw(n as ServerNode, ref);
      }
    }
  };

  augmented.replaceChildren = function (...nodes: (ServerNode | string)[]) {
    for (const n of _nodes) (n as any)._parentNode = null;
    _nodes.length = 0;
    this.append(...nodes);
  };

  augmented.getElementById = (id: string): any | null => {
    for (const n of _nodes) {
      if (n.nodeType === ELEMENT_NODE) {
        if ((n as any).id === id) return n;
        const found = (n as any).getElementById?.(id);
        if (found) return found;
      }
    }
    return null;
  };

  augmented.getElementsByTagName = function (tagName: string): ServerElement[] {
    return this.querySelectorAll(tagName);
  };

  augmented.getElementsByClassName = (className: string): ServerElement[] => {
    const results: any[] = [];
    for (const n of _nodes) {
      if (n.nodeType === ELEMENT_NODE) {
        const classes = (n as any).className?.split(/\s+/) ?? [];
        if (classes.includes(className)) results.push(n);
        results.push(...((n as any).getElementsByClassName?.(className) || []));
      }
    }
    return results;
  };

  augmented.querySelector = function (selector: string): ServerElement | null {
    if (selector.startsWith("#")) return this.getElementById(selector.slice(1));
    if (selector.startsWith(".")) return this.getElementsByClassName(selector.slice(1))[0] ?? null;
    for (const n of _nodes) {
      if (n.nodeType === ELEMENT_NODE) {
        if ((n as any).tagName?.toLowerCase() === selector.toLowerCase()) return n as ServerElement;
        const found = (n as any).querySelector?.(selector);
        if (found) return found;
      }
    }
    return null;
  };

  augmented.querySelectorAll = function (selector: string): ServerElement[] {
    if (selector.startsWith(".")) return this.getElementsByClassName(selector.slice(1));
    const results: any[] = [];
    for (const n of _nodes) {
      if (n.nodeType === ELEMENT_NODE) {
        if ((n as any).tagName?.toLowerCase() === selector.toLowerCase()) results.push(n);
        results.push(...((n as any).querySelectorAll?.(selector) || []));
      }
    }
    return results;
  };

  return augmented;
}
