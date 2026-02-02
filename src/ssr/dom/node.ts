import { COMMENT_NODE, DOCUMENT_FRAGMENT_NODE, DOCUMENT_NODE, ELEMENT_NODE, TEXT_NODE } from "../../types";
import type { ServerDocument } from "./document";
import type { ServerElement } from "./element";
import { createServerNodeList } from "./node-list";
import type { ServerNode, SupportedNodeTypes } from "./types";

/**
 * Interface for internal SSR node state.
 */
export interface InternalServerNode {
  _parentNode: (ServerNode & InternalServerNode) | null;
  _childNodes: ServerNode[];
  _ownerDocument: ServerDocument | null;
}

/**
 * Creates a base server-side node.
 */
export function createServerNode<T extends SupportedNodeTypes>(
  type: T,
  ownerDocument: ServerDocument | null = null,
): ServerNode<T> & InternalServerNode {
  const _nodes: ServerNode[] = [];
  const _list = createServerNodeList(_nodes);

  const node: ServerNode<T> & InternalServerNode = {
    nodeType: type,
    _parentNode: null,
    _childNodes: _nodes,
    _ownerDocument: ownerDocument,

    get nodeName(): string {
      switch (type) {
        case ELEMENT_NODE:
          return (node as any).tagName?.toUpperCase() || "";
        case TEXT_NODE:
          return "#text";
        case COMMENT_NODE:
          return "#comment";
        case DOCUMENT_FRAGMENT_NODE:
          return "#document-fragment";
        case DOCUMENT_NODE:
          return "#document";
        default:
          return "";
      }
    },

    get nodeValue(): string | null {
      return (node as any).data ?? null;
    },

    get parentNode(): ServerNode<SupportedNodeTypes> | null {
      return node._parentNode as ServerNode<SupportedNodeTypes> | null;
    },

    get parentElement(): ServerElement | null {
      const p = node._parentNode;
      return p && p.nodeType === ELEMENT_NODE ? (p as ServerElement) : null;
    },

    get ownerDocument(): ServerDocument | null {
      if (node._ownerDocument) return node._ownerDocument;
      return node._parentNode?.ownerDocument ?? null;
    },

    get baseURI(): string {
      return "/";
    },

    get nextSibling(): ServerNode | null {
      const p = node._parentNode;
      if (!p) return null;
      // We need to find this SPECIFIC node instance's index, but indexOf uses equality.
      // Since ServerNode is a plain object/proxy, we should ensure it's not present multiple times.
      const index = p._childNodes.indexOf(node as any);
      if (index === -1) return null;
      return p._childNodes[index + 1] ?? null;
    },
    
    get previousSibling(): ServerNode | null {
      const p = node._parentNode;
      if (!p) return null;
      const index = p._childNodes.indexOf(node as any);
      if (index === -1) return null;
      return p._childNodes[index - 1] ?? null;
    },

    get childNodes(): NodeList {
      return _list;
    },

    get isConnected(): boolean {
      if (type === DOCUMENT_NODE) return true;
      return node._parentNode?.isConnected || false;
    },

    contains(other: ServerNode): boolean {
      if (other === node) return true;
      for (const child of node._childNodes) {
        if ((child as any).contains?.(other)) return true;
      }
      return false;
    },

    get textContent(): string | null {
      if (type === TEXT_NODE || type === COMMENT_NODE) return (node as any).data;
      return node._childNodes.map((n) => n.textContent).join("");
    },

    set textContent(value: string | null) {
      if (type === TEXT_NODE || type === COMMENT_NODE) {
        (node as any).data = value ?? "";
      } else {
        // Clear and add a single text node?
        // For SSR, nested textContent updates are rare but we should be correct.
        node._childNodes.length = 0;
        if (value !== null) {
          // This creates a circular dependency if we import createServerTextNode here.
          // We'll handle this in the Element/Fragment implementations or via a registry.
        }
      }
    },

    remove(): void {
      const self = this as any;
      if (self.parentNode) {
        self.parentNode.removeChild(self);
      }
    },
    toString(): string {
      return node._childNodes.map((n) => n.toString()).join("");
    },
  };

  return node;
}
