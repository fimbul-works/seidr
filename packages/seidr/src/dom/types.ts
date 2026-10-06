import type { TYPE_COMMENT_NODE, TYPE_DOCUMENT, TYPE_ELEMENT, TYPE_TEXT_NODE } from "../constants.js";

/** Node is an element. */
export type NodeTypeElement = typeof TYPE_ELEMENT;

/** Node is a Text node. */
export type NodeTypeText = typeof TYPE_TEXT_NODE;

/** Node is a Comment node. */
export type NodeTypeComment = typeof TYPE_COMMENT_NODE;

/** Node is a Document node. */
export type NodeTypeDocument = typeof TYPE_DOCUMENT;
