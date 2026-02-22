import { TYPE_COMMENT_NODE, TYPE_DOCUMENT, TYPE_ELEMENT, TYPE_TEXT_NODE } from "../../constants";
import { createServerNodeList } from "./server-node-list";
import type { ServerDocument, ServerElement, ServerNode, SupportedNodeTypes } from "./types";

/**
 * Creates a base server-side node.
 *
 * @template {SupportedNodeTypes} T The type of node to create.
 *
 * @param {T} type The type of node to create.
 * @param {ServerDocument | null} ownerDocument The owner document of the node.
 * @returns {ServerNode<T>} The created node.
 */
export function createServerNode<T extends SupportedNodeTypes>(
  type: T,
  ownerDocument: ServerDocument | null = null,
): ServerNode<T> {
  let parentNode: ServerNode<SupportedNodeTypes> | null = null;
  const nodes: ServerNode[] = [];
  const childNodes = createServerNodeList(nodes);

  const node: ServerNode<T> = {
    get nodeType() {
      return type;
    },

    get nodeName(): string {
      switch (type) {
        case TYPE_ELEMENT:
          return (node as any).tagName?.toUpperCase() || "";
        case TYPE_TEXT_NODE:
          return "#text";
        case TYPE_COMMENT_NODE:
          return "#comment";
        case TYPE_DOCUMENT:
          return "#document";
        default:
          return "";
      }
    },

    get ownerDocument(): ServerDocument | null {
      if (ownerDocument) return ownerDocument;
      return node.parentNode?.ownerDocument ?? null;
    },

    get childNodes(): NodeList {
      return childNodes;
    },

    get nodeValue(): string | null {
      return (node as any).data ?? null;
    },

    get parentNode(): ServerNode | null {
      return parentNode;
    },

    set parentNode(value: ServerNode | null) {
      parentNode = value;
    },

    get parentElement(): ServerElement | null {
      const p = node.parentNode;
      return p && p.nodeType === TYPE_ELEMENT ? (p as ServerElement) : null;
    },

    get baseURI(): string {
      return "/";
    },

    get nextSibling(): ServerNode | null {
      const p = this.parentNode as any;
      if (!p) return null;
      const siblings = (p.childNodes as any).serverNodes;
      if (!siblings) return null;
      const index = siblings.indexOf(this as any);
      if (index === -1) return null;
      return siblings[index + 1] ?? null;
    },

    get previousSibling(): ServerNode | null {
      const p = this.parentNode as any;
      if (!p) return null;
      const siblings = (p.childNodes as any).serverNodes;
      if (!siblings) return null;
      const index = siblings.indexOf(this as any);
      if (index === -1) return null;
      return siblings[index - 1] ?? null;
    },

    get isConnected(): boolean {
      if (type === TYPE_DOCUMENT) return true;
      return node.parentNode?.isConnected || false;
    },

    contains(other: ServerNode): boolean {
      if (other === node) return true;
      for (const child of node.childNodes) {
        if ((child as any).contains?.(other)) return true;
      }
      return false;
    },

    get textContent(): string | null {
      if (type === TYPE_TEXT_NODE || type === TYPE_COMMENT_NODE) {
        return (node as any).data;
      }

      return nodes.map((n) => n.textContent).join("");
    },

    set textContent(value: string | null) {
      if (type === TYPE_TEXT_NODE || type === TYPE_COMMENT_NODE) {
        (node as any).data = value ?? "";
      } else {
        nodes.length = 0;
      }
    },

    remove(): void {
      const self = this as any;
      if (self.parentNode) {
        self.parentNode.removeChild(self);
      }
    },

    toString(): string {
      return nodes.map((n) => n.toString()).join("");
    },
  };

  return node;
}
