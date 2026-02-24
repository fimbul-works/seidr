import { TYPE_COMMENT_NODE, TYPE_DOCUMENT, TYPE_ELEMENT, TYPE_TEXT_NODE } from "../../constants";
import { createServerNodeList, type ServerNodeList } from "./server-node-list";
import type { ServerDocument, ServerElement, ServerNode, ServerTextNode, SupportedNodeTypes } from "./types";

/**
 * Creates a base server-side node.
 *
 * @template {SupportedNodeTypes} T The type of node to create.
 *
 * @param {T} type The type of node to create.
 * @param {ServerDocument | null} ownerDocument The owner document of the node.
 * @returns {ServerNode<T>} The created node.
 */
export function createServerNode<T extends SupportedNodeTypes = SupportedNodeTypes>(
  type: T,
  ownerDocument: ServerDocument | null = null,
): ServerNode<T> {
  let parentNode: ServerNode<SupportedNodeTypes> | null = null;
  const nodes: ServerNode[] = [];
  const childNodes = createServerNodeList(nodes);

  const node = {
    get nodeType() {
      return type;
    },

    get nodeName(): string {
      switch (type) {
        case TYPE_ELEMENT:
          return (node as unknown as ServerElement).tagName?.toUpperCase() || "";
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
      return (node as ServerNode).parentNode?.ownerDocument ?? null;
    },

    get childNodes(): NodeList {
      return childNodes;
    },

    get nodeValue(): string | null {
      return (node as unknown as ServerTextNode).data ?? null;
    },

    get parentNode(): ServerNode | null {
      return parentNode;
    },

    set parentNode(value: ServerNode | null) {
      parentNode = value;
    },

    get parentElement(): ServerElement | null {
      const p = (node as ServerNode).parentNode;
      return p && p.nodeType === TYPE_ELEMENT ? (p as ServerElement) : null;
    },

    get baseURI(): string {
      return "/";
    },

    get nextSibling(): ServerNode | null {
      const p = (node as ServerNode).parentNode;
      if (!p) return null;
      const siblings = (p.childNodes as ServerNodeList).serverNodes;
      if (!siblings) return null;
      const index = siblings.indexOf(node as ServerNode);
      if (index === -1) return null;
      return siblings[index + 1] ?? null;
    },

    get previousSibling(): ServerNode | null {
      const p = (node as ServerNode).parentNode;
      if (!p) return null;
      const siblings = (p.childNodes as ServerNodeList).serverNodes;
      if (!siblings) return null;
      const index = siblings.indexOf(node as ServerNode);
      if (index === -1) return null;
      return siblings[index - 1] ?? null;
    },

    get isConnected(): boolean {
      if (type === TYPE_DOCUMENT) return true;
      return (node as ServerNode).parentNode?.isConnected || false;
    },

    contains(other: ServerNode): boolean {
      if (other === node) return true;
      for (const child of (node as ServerNode).childNodes) {
        if (child.contains?.(other as unknown as Node)) return true;
      }
      return false;
    },

    get textContent(): string | null {
      if (type === TYPE_TEXT_NODE || type === TYPE_COMMENT_NODE) {
        return (node as unknown as Text).data;
      }

      return nodes.map((n) => n.textContent).join("");
    },

    set textContent(value: string | null) {
      if (type === TYPE_TEXT_NODE || type === TYPE_COMMENT_NODE) {
        (node as unknown as Text).data = value ?? "";
      } else {
        nodes.length = 0;
      }
    },

    remove(): void {
      const self = this as unknown as Node;
      if (self.parentNode) {
        self.parentNode.removeChild(self);
      }
    },

    toString(): string {
      return nodes.map((n) => n.toString()).join("");
    },
  } as ServerNode<T>;

  return node;
}
