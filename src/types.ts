import type { TYPE_COMMENT_NODE, TYPE_DOCUMENT, TYPE_ELEMENT, TYPE_TEXT_NODE } from "./constants";

/**
 * Error class for Seidr.
 */
export class SeidrError extends Error {
  name = "SeidrError";
}

/**
 * Type for event handlers that can be synchronous or asynchronous.
 *
 * @template T - The data type for the event
 * @param {T} data - Data to handle
 */
export type EventHandler<T> = (data: T) => void | Promise<void>;

/**
 * Type for cleanup functions.
 */
export type CleanupFunction = () => void;

/** node is an element. */
export type NodeTypeElement = typeof TYPE_ELEMENT;

/** node is a Text node. */
export type NodeTypeText = typeof TYPE_TEXT_NODE;

/** node is a Comment node. */
export type NodeTypeComment = typeof TYPE_COMMENT_NODE;

/** node is a Document node. */
export type NodeTypeDocument = typeof TYPE_DOCUMENT;
