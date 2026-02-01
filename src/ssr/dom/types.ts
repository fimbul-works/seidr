import type { ServerDocument } from "./document";
import type { ServerElement } from "./element";

/** node is an element. */
export const ELEMENT_NODE = 1;
export type NodeTypeElement = typeof ELEMENT_NODE;

/** node is a Text node. */
export const TEXT_NODE = 3;
export type NodeTypeText = typeof TEXT_NODE;

/** node is a Comment node. */
export const COMMENT_NODE = 8;
export type NodeTypeComment = typeof COMMENT_NODE;

/** node is a Document node. */
export const DOCUMENT_NODE = 9;
export type NodeTypeDocument = typeof DOCUMENT_NODE;

/** node is a DocumentFragment node. */
export const DOCUMENT_FRAGMENT_NODE = 11;
export type NodeTypeDocumentFragment = typeof DOCUMENT_FRAGMENT_NODE;

/** Suppoted DOM node types for SSR */
export type SupportedNodeTypes =
  | NodeTypeElement
  | NodeTypeText
  | NodeTypeComment
  | NodeTypeDocumentFragment
  | NodeTypeDocument;

/** node has child nodes */
export type NodeTypeWithChildNodes = NodeTypeElement | NodeTypeDocumentFragment;

/**
 * Represents a node in the server-side DOM tree.
 * @internal
 */
export type ServerNodeType =
  | (ServerNode & {
      _parentNode: (ServerNode & any) | null;
      _childNodes: ServerNode[];
    })
  | string;

export interface ServerNode<T extends SupportedNodeTypes = SupportedNodeTypes> {
  readonly nodeType: T;
  readonly nodeName: string;
  readonly nodeValue: string | null;

  readonly ownerDocument: ServerDocument | null;
  readonly isConnected: boolean;
  readonly parentNode: ServerNode<SupportedNodeTypes> | null;
  readonly parentElement: ServerElement | null;
  readonly baseURI: string;

  readonly childNodes: NodeList;
  contains(other: ServerNode): boolean;

  textContent?: string | null;
  toString(): string;
}

export interface ServerParentNode {
  children: ServerNode[];
  firstChild: ServerNode | null;
  lastChild: ServerNode | null;
  childElementCount: number;
  append(...nodes: (ServerNode | string)[]): void;
  prepend(...nodes: (ServerNode | string)[]): void;
  replaceChildren(...nodes: (ServerNode | string)[]): void;
  insertBefore<T extends ServerNode>(newNode: T, referenceNode: ServerNode | null): T;
  appendChild<T extends ServerNode>(child: T): T;
  removeChild<T extends ServerNode>(child: T): T;
  getElementById(id: string): ServerElement | null;
  getElementsByTagName(tagName: string): ServerElement[];
  getElementsByClassName(className: string): ServerElement[];
  querySelector(selector: string): ServerElement | null;
  querySelectorAll(selector: string): ServerElement[];
}
