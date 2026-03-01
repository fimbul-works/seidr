import { TYPE_COMMENT_NODE, TYPE_DOCUMENT, TYPE_ELEMENT, TYPE_TEXT_NODE } from "../../constants";
import { SSRComment } from "./new/ssr-comment";
import { SSRDocument } from "./new/ssr-document";
import { SSRElement } from "./new/ssr-element";
import { SSRTextNode } from "./new/ssr-text-node";

export * from "./new/ssr-comment";
export * from "./new/ssr-document";
export * from "./new/ssr-element";
export * from "./new/ssr-node";
export * from "./new/ssr-text-node";
export * from "./new/types";
export * from "./server-node-list";

export function createServerDocument(): Document {
  return new SSRDocument().mockDocument;
}

export function createServerElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  ownerDocument?: Document,
): HTMLElement {
  return new SSRElement(tagName, ownerDocument as any).mockElement;
}

export function createServerTextNode(data: string, ownerDocument?: Document): Text {
  return new SSRTextNode(data, ownerDocument as any).mockText;
}

export function createServerComment(data: string, ownerDocument?: Document): Comment {
  return new SSRComment(data, ownerDocument as any).mockComment;
}

export function createServerNode(type: number, ownerDocument?: Document): any {
  switch (type) {
    case TYPE_ELEMENT:
      return createServerElement("div" as any, ownerDocument);
    case TYPE_TEXT_NODE:
      return createServerTextNode("", ownerDocument);
    case TYPE_COMMENT_NODE:
      return createServerComment("", ownerDocument);
    case TYPE_DOCUMENT:
      return createServerDocument();
    default:
      return null;
  }
}

export function applyParentNodeMethods(node: any): any {
  return node;
}
