import { isDocumentFragment, isHTMLElement, isObj } from "../../util/type-guards";
import { createServerTextNode } from "./character-data";
import {
  type BaseServerNodeInterface,
  DOCUMENT_FRAGMENT_NODE,
  ELEMENT_NODE,
  type NodeTypeWithChildNodes,
  SET_PARENT,
  type ServerNodeType,
} from "./types";
import type { ServerNodeWithParent } from "./with-parent";

/**
 * Interface for server-side nodes that can have children.
 * Combines functionality for both child nodes and specific child elements.
 */
export interface ServerNodeWithChildren<T extends NodeTypeWithChildNodes = NodeTypeWithChildNodes>
  extends BaseServerNodeInterface<T> {
  // Node interface properties
  readonly childNodes: ServerNodeWithParent[];
  readonly firstChild: ServerNodeWithParent | null;
  readonly lastChild: ServerNodeWithParent | null;

  // DocumentFragment/Element properties
  readonly childElementCount: number;
  readonly children: any[]; // Using any to avoid circularity with ServerHTMLElement
  readonly firstElementChild: any | null;
  readonly lastElementChild: any | null;

  // Node interface methods
  hasChildNodes(): boolean;
  appendChild(node: ServerNodeType): void;
  removeChild(node: ServerNodeWithParent): void;
  contains(child: ServerNodeWithParent): boolean;
  insertBefore(newNode: ServerNodeType, referenceNode: ServerNodeWithParent | null): void;
  replaceChild(newNode: ServerNodeType, oldChild: ServerNodeWithParent): void;

  // ParentNode interface methods (DocumentFragment/Element/Document)
  append(...nodes: ServerNodeType[]): void;
  prepend(...nodes: ServerNodeType[]): void;
  replaceChildren(...nodes: ServerNodeType[]): void;
  querySelector(selector: string): any | null;
  querySelectorAll(selector: string): any[];

  // DocumentFragment specific / common methods
  getElementById(id: string): any | null;
  moveBefore(node: ServerNodeType, referenceNode: ServerNodeType | null): void;

  // Utility / Extra methods
  getElementsByTagName(tagName: string): any[];
  getElementsByClassName(className: string): any[];
  clear(): void;
}

/**
 * Decorator that adds child node and child element management to a server-side node.
 * Supports persistent ranges if 'start' and 'end' markers are present.
 * Also acts as a wrapper for native nodes if provided.
 */
export function nodeWithChildrenExtension<
  T extends NodeTypeWithChildNodes = NodeTypeWithChildNodes,
  N extends BaseServerNodeInterface<T> = BaseServerNodeInterface<T>,
>(node: N): N & ServerNodeWithChildren<T> {
  const _internalChildNodes: ServerNodeWithParent[] = [];

  // Capture original methods if they exist (for native Node wrapping)
  const originalAppendChild = (node as any).appendChild;
  const originalInsertBefore = (node as any).insertBefore;
  const originalRemoveChild = (node as any).removeChild;

  const ext = {
    // --- Node Interface Properties ---
    get childNodes(): ServerNodeWithParent[] {
      const self = node as any;
      // 1. Live Range Priority
      if (self.start && self.end && self.start.parentNode) {
        const result: ServerNodeWithParent[] = [];
        let curr = self.start.nextSibling;
        while (curr && curr !== self.end) {
          result.push(curr as ServerNodeWithParent);
          curr = curr.nextSibling;
        }
        return result;
      }
      // 2. Native Storage Priority (if not range)
      if (originalAppendChild && _internalChildNodes.length === 0) {
        return Array.from((node as any).childNodes) as any;
      }
      // 3. SSR Internal Storage
      return _internalChildNodes;
    },
    get firstChild() {
      const nodes = this.childNodes;
      return nodes[0] ?? null;
    },
    get lastChild() {
      const nodes = this.childNodes;
      return nodes[nodes.length - 1] ?? null;
    },

    // --- ParentNode Interface Properties ---
    get children() {
      return (this.childNodes as any[]).filter(isHTMLElement);
    },
    get childElementCount() {
      return this.children.length;
    },
    get firstElementChild() {
      return this.children[0] ?? null;
    },
    get lastElementChild() {
      const children = this.children;
      return children[children.length - 1] ?? null;
    },

    // --- Node Interface Methods ---
    hasChildNodes() {
      return this.childNodes.length > 0;
    },

    appendChild(child: ServerNodeType) {
      if (isDocumentFragment(child) && !(child as any).isSeidrFragment) {
        const fragment = child as ServerNodeWithChildren;
        const childrenToMove = [...fragment.childNodes];
        for (const grandchild of childrenToMove) {
          this.appendChild(grandchild);
        }
        return;
      }
      const n = (!isObj(child) ? createServerTextNode(String(child)) : child) as ServerNodeWithParent;

      const self = node as any;
      // 1. Live Range
      if (self.start && self.end && self.start.parentNode) {
        self.start.parentNode.insertBefore(n, self.end);
        return;
      }

      // 2. Native Wrapper
      if (originalAppendChild) {
        originalAppendChild.call(node, n);
      }

      // 3. SSR Internal List
      if (_internalChildNodes.includes(n)) {
        const idx = _internalChildNodes.indexOf(n);
        _internalChildNodes.splice(idx, 1);
      }
      _internalChildNodes.push(n);

      if (n[SET_PARENT]) {
        const potentialParent = "nodeType" in node ? node : (node as any).parentNode;
        if (potentialParent) {
          n[SET_PARENT](potentialParent as any);
        }
      }
    },

    removeChild(child: ServerNodeWithParent) {
      const self = node as any;
      // 1. Live Range
      if (self.start && self.end && self.start.parentNode) {
        self.start.parentNode.removeChild(child);
        return;
      }

      // 2. Native Wrapper
      if (originalRemoveChild) {
        originalRemoveChild.call(node, child);
      }

      // 3. SSR Internal List
      const idx = _internalChildNodes.indexOf(child);
      if (idx >= 0) {
        _internalChildNodes.splice(idx, 1);
        if (child[SET_PARENT]) {
          child[SET_PARENT](null);
        }
      }
    },

    contains(child: ServerNodeType) {
      if (child === node) return true;
      if (!isObj(child)) return false;
      const n = child as ServerNodeWithParent;

      // Check for direct parent
      if (n.parentNode === node) {
        return true;
      }

      // Gather all nested child nodes
      for (const c of this.childNodes) {
        if (c === n) return true;
        if ("contains" in c && (c as any).contains(n)) return true;
      }

      return false;
    },

    insertBefore(newChild: ServerNodeType, referenceNode: ServerNodeWithParent | null) {
      if (isDocumentFragment(newChild) && !(newChild as any).isSeidrFragment) {
        const fragment = newChild as ServerNodeWithChildren;
        const childrenToMove = [...fragment.childNodes];
        for (const c of childrenToMove) {
          this.insertBefore(c, referenceNode);
        }
        return;
      }
      const n = (!isObj(newChild) ? createServerTextNode(String(newChild)) : newChild) as ServerNodeWithParent;

      const self = node as any;
      // 1. Live Range
      if (self.start && self.end && self.start.parentNode) {
        const actualRef = referenceNode || self.end;
        self.start.parentNode.insertBefore(n, actualRef);
        return;
      }

      // 2. Native Wrapper
      if (originalInsertBefore) {
        originalInsertBefore.call(node, n, referenceNode);
      }

      // 3. SSR Internal List
      const existingIdx = _internalChildNodes.indexOf(n);
      if (existingIdx !== -1) {
        _internalChildNodes.splice(existingIdx, 1);
      }

      const idx = referenceNode ? _internalChildNodes.indexOf(referenceNode) : _internalChildNodes.length;
      if (idx === -1) {
        throw new Error("Cannot insert before non-existing child");
      }

      _internalChildNodes.splice(idx, 0, n);
      if (n[SET_PARENT]) {
        const potentialParent = "nodeType" in node ? node : (node as any).parentNode;
        if (potentialParent) {
          n[SET_PARENT](potentialParent as any);
        }
      }
    },

    replaceChild(newChild: ServerNodeType, oldChild: ServerNodeWithParent) {
      this.insertBefore(newChild, oldChild);
      this.removeChild(oldChild);
    },

    // --- ParentNode Interface Methods ---
    append(...nodes: ServerNodeType[]) {
      for (const n of nodes) {
        this.appendChild(n);
      }
    },

    prepend(...nodes: ServerNodeType[]) {
      const first = this.firstChild;
      for (const n of nodes) {
        this.insertBefore(n, first);
      }
    },

    replaceChildren(...nodes: ServerNodeType[]) {
      this.clear();
      this.append(...nodes);
    },

    moveBefore(n: ServerNodeType, referenceNode: ServerNodeType | null) {
      // Optimistically treated as insertBefore in this mockup
      this.insertBefore(n, referenceNode as ServerNodeWithParent | null);
    },

    // --- Query Methods ---
    querySelector(selector: string): any | null {
      if (selector.startsWith("#")) return this.getElementById(selector.slice(1));
      if (selector.startsWith(".")) return this.getElementsByClassName(selector.slice(1))[0] ?? null;
      return this.getElementsByTagName(selector)[0] ?? null;
    },

    querySelectorAll(selector: string): any[] {
      if (selector.startsWith("#")) {
        const el = this.getElementById(selector.slice(1));
        return el ? [el] : [];
      }
      if (selector.startsWith(".")) return this.getElementsByClassName(selector.slice(1));
      return this.getElementsByTagName(selector);
    },

    getElementById(id: string): any | null {
      for (const child of this.childNodes) {
        if (!isHTMLElement(child)) continue;
        if ((child as any).id === id) return child;
        if ((child as any).getElementById) {
          const found = (child as any).getElementById(id);
          if (found) return found;
        }
      }
      return null;
    },

    getElementsByTagName(tagName: string): any[] {
      const results: any[] = [];
      const tag = tagName.toLowerCase();
      for (const child of this.childNodes) {
        if (!isHTMLElement(child)) continue;
        if ((child as any).tagName?.toLowerCase() === tag || tag === "*") {
          results.push(child);
        }
        if ((child as any).getElementsByTagName) {
          results.push(...(child as any).getElementsByTagName(tagName));
        }
      }
      return results;
    },

    getElementsByClassName(className: string): any[] {
      const results: any[] = [];
      for (const child of this.childNodes) {
        if (!isHTMLElement(child)) continue;
        const classes = (child as any).className?.split(/\s+/) ?? [];
        if (classes.includes(className)) {
          results.push(child);
        }
        if ((child as any).getElementsByClassName) {
          results.push(...(child as any).getElementsByClassName(className));
        }
      }
      return results;
    },

    // --- Utility Methods ---
    clear() {
      const children = [...this.childNodes];
      for (const child of children) {
        if ("remove" in child && typeof child.remove === "function") {
          child.remove();
        } else {
          this.removeChild(child);
        }
      }
    },
  };

  return Object.defineProperties(node, Object.getOwnPropertyDescriptors(ext)) as any;
}
