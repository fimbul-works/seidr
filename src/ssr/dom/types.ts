import type { NodeTypeComment, NodeTypeDocument, NodeTypeElement, NodeTypeText } from "../../types";
import type { SSRComment, SSRDocument, SSRElement, SSRNode, SSRTextNode } from "./index";

/** Suppoted DOM node types for SSR */
export type SupportedNodeTypes = NodeTypeElement | NodeTypeText | NodeTypeComment | NodeTypeDocument;

/**
 * Represents a node in the server-side DOM tree.
 */
export type ServerNodeType = SSRNode<any, any> | string;

export type ServerNode = SSRNode<any, any>;

export type ServerTextNode = SSRTextNode;

export type ServerComment = SSRComment;

export type ServerDocument = SSRDocument;

export type ServerElement = SSRElement;
