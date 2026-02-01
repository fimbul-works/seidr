import { isDocumentFragment, isObj, isStr } from "../../util";
import { createServerTextNode } from "./character-data";
import type { BaseServerNodeInterface, NodeTypeWithChildNodes, ServerNodeType } from "./types";
import type { ServerNodeWithParent } from "./with-parent";

export interface ServerNodeWithChildNodes<T extends NodeTypeWithChildNodes = NodeTypeWithChildNodes>
  extends BaseServerNodeInterface<T> {
  readonly childNodes: ServerNodeWithParent[];
  readonly firstChild: ServerNodeWithParent | null;
  readonly lastChild: ServerNodeWithParent | null;
  hasChildNodes(): boolean;
  appendChild(node: ServerNodeType): void;
  removeChild(node: ServerNodeWithParent): void;
  contains(child: ServerNodeWithParent): boolean;
  insertBefore(newNode: ServerNodeType, referenceNode: ServerNodeWithParent | null): void;
  replaceChild(newNode: ServerNodeType, oldChild: ServerNodeWithParent): void;
  clear(): void;
}

export function nodeWithChildNodesExtension<
  T extends NodeTypeWithChildNodes = NodeTypeWithChildNodes,
  N extends BaseServerNodeInterface<T> = BaseServerNodeInterface<T>,
>(node: N): N & ServerNodeWithChildNodes<T> {
  const _childNodes: ServerNodeWithParent[] = [];

  const ext: ServerNodeWithChildNodes<T> = {
    get childNodes() {
      return _childNodes;
    },
    get firstChild() {
      return _childNodes[0] ?? null;
    },
    get lastChild() {
      return _childNodes[_childNodes.length - 1] ?? null;
    },
    hasChildNodes() {
      return _childNodes.length > 0;
    },
    appendChild(child: ServerNodeType) {
      if (isDocumentFragment(child) && !(child as any).isSeidrFragment) {
        for (const grandchild of [...(child as any).childNodes]) {
          this.appendChild(grandchild);
        }
        return;
      }
      const n = (!isObj(child) ? createServerTextNode(String(child)) : child) as ServerNodeWithParent;

      if (_childNodes.includes(n)) {
        // Already a child, move to end
        const idx = _childNodes.indexOf(n);
        _childNodes.splice(idx, 1);
      }

      // Add to internal list first to avoid recursion in parentNode setter
      _childNodes.push(n);
      if ("parent" in n) {
        n.parent = node as any;
      }
    },
    removeChild(child: ServerNodeWithParent) {
      const idx = _childNodes.indexOf(child);
      if (idx >= 0) {
        _childNodes.splice(idx, 1);
        if ("parent" in child) {
          child.parent = null;
        }
      }
    },
    contains(child: ServerNodeType) {
      if (child === node) return true;
      const n = (!isObj(child) ? createServerTextNode(String(child)) : child) as ServerNodeWithParent;

      // Check for direct parent
      if (n.parentNode !== null && (n as any).parentNode === node) {
        return true;
      }

      // Gather all nested child nodes
      for (const c of _childNodes) {
        if (c === n) return true;
        if ("contains" in c && (c as any).contains(n)) return true;
      }

      return false;
    },
    insertBefore(newChild: ServerNodeType, referenceNode: ServerNodeWithParent | null) {
      if (isDocumentFragment(newChild) && !(newChild as any).isSeidrFragment) {
        const fragment = newChild as ServerNodeWithChildNodes;
        const children = [...fragment.childNodes];
        for (const c of children) {
          this.insertBefore(c, referenceNode);
        }
        return;
      }
      const n = (!isObj(newChild) ? createServerTextNode(String(newChild)) : newChild) as ServerNodeWithParent;

      const existingIdx = _childNodes.indexOf(n);
      if (existingIdx !== -1) {
        _childNodes.splice(existingIdx, 1);
      }

      const idx = referenceNode ? _childNodes.indexOf(referenceNode) : _childNodes.length;
      if (idx === -1) {
        throw new Error("Cannot insert before non-existing child");
      }

      _childNodes.splice(idx, 0, n);
      if ("parent" in n) {
        n.parent = node as any;
      }
    },
    replaceChild(newChild: ServerNodeType, oldChild: ServerNodeWithParent) {
      const idx = _childNodes.indexOf(oldChild);
      if (idx >= 0) {
        this.insertBefore(newChild, oldChild);
        this.removeChild(oldChild);
      }
    },
    clear() {
      const children = [..._childNodes];
      for (const child of children) {
        if ("remove" in child && typeof child.remove === "function") {
          child.remove();
        } else {
          this.removeChild(child);
        }
      }
    },
  } as any;

  return Object.defineProperties(node, Object.getOwnPropertyDescriptors(ext)) as any;
}
