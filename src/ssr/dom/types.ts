/** node is an element. */
export const ELEMENT_NODE = 1;
export type NodeTypeElement = typeof ELEMENT_NODE;

/** node is a Text node. */
export const TEXT_NODE = 3;
export type NodeTypeText = typeof TEXT_NODE;

/** node is a Comment node. */
export const COMMENT_NODE = 8;
export type NodeTypeComment = typeof COMMENT_NODE;

/** node is a DocumentFragment node. */
export const DOCUMENT_FRAGMENT_NODE = 11;
export type NodeTypeDocumentFragment = typeof DOCUMENT_FRAGMENT_NODE;

/** Suppoted DOM node types for SSR */
export type SupportedNodeTypes = NodeTypeElement | NodeTypeText | NodeTypeComment | NodeTypeDocumentFragment;

/** node has child nodes */
export type NodeTypeWithChildNodes = NodeTypeElement | NodeTypeDocumentFragment;

/**
 * Represents a node in the server-side DOM tree.
 * @internal
 */
export type ServerNodeType =
  | any // TODO: refine this to avoid circular dependencies
  | string;

export interface BaseServerNodeInterface<T extends SupportedNodeTypes = SupportedNodeTypes> {
  readonly nodeType: T;
  readonly nodeName: string;
  readonly nodeValue: string | null;
  textContent?: string | null;
  toString(): string;
}

export interface ServerNodeWithQueryInterface {
  querySelector(selectors: string): any | null;
  querySelectorAll(selectors: string): any[];
  getElementsByTagName(tagName: string): any[];
}
