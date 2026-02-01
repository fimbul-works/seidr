import type { ServerHTMLElement } from "./server-html-element";
import {
  type BaseServerNodeInterface,
  DOCUMENT_FRAGMENT_NODE,
  ELEMENT_NODE,
  type NodeTypeWithChildNodes,
  type SupportedNodeTypes,
} from "./types";
import type { ServerNodeWithChildNodes } from "./with-child-nodes";

export interface ServerNodeWithParent<T extends SupportedNodeTypes = SupportedNodeTypes>
  extends BaseServerNodeInterface<T> {
  parentNode: ServerNodeWithChildNodes<NodeTypeWithChildNodes> | null;
  readonly parentElement: ServerHTMLElement | null;
  readonly nextSibling: ServerNodeWithParent | null;
  readonly previousSibling: ServerNodeWithParent | null;
  remove(): void;
}

export function nodeWithParentExtension<
  T extends BaseServerNodeInterface<SupportedNodeTypes> = BaseServerNodeInterface<SupportedNodeTypes>,
>(
  node: T,
  options: {
    onAttached?: (parent: ServerNodeWithChildNodes) => void;
    onRemove?: (parent: ServerNodeWithChildNodes) => void;
  } = {},
): T & ServerNodeWithParent<T["nodeType"]> {
  const { onAttached, onRemove } = options;
  let _parent: ServerNodeWithChildNodes | null = null;

  const ext = {
    get parentNode(): ServerNodeWithChildNodes | null {
      return _parent;
    },
    set parentNode(newParent: ServerNodeWithChildNodes | null) {
      // Do nothing when the parent is the same
      if (newParent === _parent) return;

      // Remove from current parent
      if (_parent) {
        const oldParent = _parent;
        _parent = null; // Set to null first to avoid recursion during removeChild
        onRemove?.(oldParent);
        oldParent.removeChild(node as any);
      }

      // Validate new parent
      if (newParent && ![ELEMENT_NODE, DOCUMENT_FRAGMENT_NODE].includes(newParent.nodeType)) {
        throw new Error("Parent node must be an element or a document fragment");
      }

      // Set new parent
      _parent = newParent;
      if (_parent) {
        onAttached?.(_parent);
        // Ensure child is in parent's childNodes
        if (!_parent.childNodes.includes(node as any)) {
          _parent.appendChild(node as any);
        }
      }
    },
    get parentElement() {
      // Return parent if it is an element
      if (_parent?.nodeType === ELEMENT_NODE) {
        return _parent as any;
      }
      return null;
    },
    get nextSibling(): ServerNodeWithParent | null {
      const childNodes = _parent?.childNodes;
      if (!childNodes) return null;

      // Find index of current node
      const idx = childNodes.indexOf(node as any);
      if (idx >= childNodes.length - 1) return null;

      // Return next sibling
      return childNodes[idx + 1] ?? null;
    },
    get previousSibling(): ServerNodeWithParent | null {
      const childNodes = _parent?.childNodes;
      if (!childNodes) return null;

      // Find index of current node
      const idx = childNodes.indexOf(node as any);
      if (idx <= 0) return null;

      // Return previous sibling
      return childNodes[idx - 1] ?? null;
    },
    remove() {
      if (!_parent) return;
      onRemove?.(_parent);
      _parent.removeChild(node as any);
    },
  } as ServerNodeWithParent<T["nodeType"]>;

  return Object.defineProperties(node, Object.getOwnPropertyDescriptors(ext)) as T &
    ServerNodeWithParent<T["nodeType"]>;
}
