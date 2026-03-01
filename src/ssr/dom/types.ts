// import type { NodeTypeComment, NodeTypeDocument, NodeTypeElement, NodeTypeText } from "../../types";

// /** Suppoted DOM node types for SSR */
// export type SupportedNodeTypes = NodeTypeElement | NodeTypeText | NodeTypeComment | NodeTypeDocument;

// /**
//  * Represents a node in the server-side DOM tree.
//  */
// export type ServerNodeType = ServerNode | string;

// /**
//  * Represents a node in the server-side DOM tree.
//  */
// export interface ServerNode<T extends SupportedNodeTypes = SupportedNodeTypes> {
//   readonly nodeType: T;
//   readonly nodeName: string;
//   readonly nodeValue: string | null;
//   readonly ownerDocument: ServerDocument | null;
//   readonly isConnected: boolean;
//   parentNode: ServerNode<SupportedNodeTypes> | null;
//   readonly parentElement: ServerElement | null;
//   readonly baseURI: string;
//   readonly nextSibling: ServerNode | null;
//   readonly previousSibling: ServerNode | null;
//   readonly childNodes: NodeList;
//   contains(other: ServerNode): boolean;
//   textContent: string | null;
//   toString(): string;
// }

// /**
//  * Interface for nodes that can have children.
//  */
// export interface ServerParentNode<T extends SupportedNodeTypes = SupportedNodeTypes> extends ServerNode<T> {
//   children: ServerNode[];
//   firstChild: ServerNode | null;
//   lastChild: ServerNode | null;
//   childElementCount: number;
//   append(...nodes: (ServerNode | string)[]): void;
//   prepend(...nodes: (ServerNode | string)[]): void;
//   replaceChildren(...nodes: (ServerNode | string)[]): void;
//   insertBefore<T extends ServerNode>(newNode: T, referenceNode: ServerNode | null): T;
//   appendChild<T extends ServerNode>(child: T): T;
//   removeChild<T extends ServerNode>(child: T): T;
//   getElementById(id: string): ServerElement | null;
//   getElementsByTagName(tagName: string): ServerElement[];
//   getElementsByClassName(className: string): ServerElement[];
//   querySelector(selector: string): ServerElement | null;
//   querySelectorAll(selector: string): ServerElement[];
// }

// /**
//  * Server-side text node.
//  */
// export interface ServerTextNode extends ServerNode<NodeTypeText> {
//   data: string;
// }

// /**
//  * Server-side comment node.
//  */
// export interface ServerCommentNode extends ServerNode<NodeTypeComment> {
//   data: string;
// }

// /**
//  * Server-side element node.
//  */
// export interface ServerElement<K extends keyof HTMLElementTagNameMap = keyof HTMLElementTagNameMap>
//   extends ServerNode<NodeTypeElement>,
//     ServerParentNode<NodeTypeElement> {
//   tagName: K;
//   id: string;
//   className: string;
//   style: any;
//   dataset: any;
//   attributes: Record<string, string>;
//   classList: DOMTokenList;
//   innerHTML: string;
//   outerHTML: string;
//   setAttribute(name: string, value: string | boolean | null): void;
//   getAttribute(name: string): string | null;
//   hasAttribute(name: string): boolean;
//   removeAttribute(name: string): void;
//   addEventListener(event: string, handler: EventListener): void;
//   removeEventListener(event: string, handler: EventListener): void;
//   matches(selector: string): boolean;
// }

// /**
//  * Server-side document node.
//  */
// export interface ServerDocument extends ServerParentNode<NodeTypeDocument> {
//   documentElement: ServerElement;
//   body: ServerElement;
//   head: ServerElement;
//   createElement(tagName: string): any;
//   createTextNode(text: string): any;
//   createComment(text: string): any;
// }
