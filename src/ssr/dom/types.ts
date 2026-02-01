import type {
  NodeTypeComment,
  NodeTypeDocument,
  NodeTypeDocumentFragment,
  NodeTypeElement,
  NodeTypeText,
} from "../../types";
import type { ServerDocument } from "./document";
import type { ServerElement } from "./element";

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
