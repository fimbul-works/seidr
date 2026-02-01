import type { ServerElement } from "./element";
import type { InternalServerNode } from "./node";
import { ELEMENT_NODE, type ServerNode, type ServerParentNode } from "./types";

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

  augmented.insertBefore = <U extends ServerNode>(newNode: U, referenceNode: ServerNode | null): U => {
    const n = newNode as any;
    n._parentNode = augmented;

    if (referenceNode === null) {
      _nodes.push(n);
    } else {
      const index = _nodes.indexOf(referenceNode as any);
      if (index === -1) {
        throw new Error("The node before which the new node is to be inserted is not a child of this node.");
      }
      _nodes.splice(index, 0, n);
    }
    return newNode;
  };

  augmented.appendChild = <U extends ServerNode>(child: U): U => {
    return augmented.insertBefore(child, null);
  };

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
    nodes.forEach((n) => {
      if (typeof n !== "string") {
        augmented.appendChild(n as ServerNode);
      }
    });
  };

  augmented.prepend = (...nodes: (ServerNode | string)[]) => {
    nodes.reverse().forEach((n) => {
      if (typeof n !== "string") {
        augmented.insertBefore(n as ServerNode, _nodes[0] || null);
      }
    });
  };

  augmented.replaceChildren = (...nodes: (ServerNode | string)[]) => {
    _nodes.forEach((n: any) => (n._parentNode = null));
    _nodes.length = 0;
    augmented.append(...nodes);
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

  augmented.getElementsByTagName = (tagName: string): ServerElement[] => {
    return augmented.querySelectorAll(tagName);
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

  augmented.querySelector = (selector: string): ServerElement | null => {
    if (selector.startsWith("#")) return augmented.getElementById(selector.slice(1));
    if (selector.startsWith(".")) return augmented.getElementsByClassName(selector.slice(1))[0] ?? null;
    for (const n of _nodes) {
      if (n.nodeType === ELEMENT_NODE) {
        if ((n as any).tagName?.toLowerCase() === selector.toLowerCase()) return n as ServerElement;
        const found = (n as any).querySelector?.(selector);
        if (found) return found;
      }
    }
    return null;
  };

  augmented.querySelectorAll = (selector: string): ServerElement[] => {
    if (selector.startsWith(".")) return augmented.getElementsByClassName(selector.slice(1));
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
