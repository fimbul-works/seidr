import type { TYPE_COMMENT_NODE, TYPE_DOCUMENT, TYPE_ELEMENT, TYPE_TEXT_NODE } from "./constants";

/**
 * Error class for Seidr.
 */
export class SeidrError extends Error {
  /**
   * Creates a new SeidrError.
   *
   * @param {string} message - The error message
   * @param details - Error details
   */
  constructor(
    message: string,
    public readonly details?: any,
  ) {
    super(message);
    this.name = "SeidrError";
  }
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

/**
 * Checks if a string is in camelCase.
 *
 * @template S - The string to check
 * @returns true if the string is in camelCase, false otherwise
 */
export type IsCamelCase<S extends string> = S extends `${string}${"-" | "_"}${string}`
  ? false
  : S extends `${infer First}${string}`
    ? First extends Lowercase<First>
      ? true
      : false
    : false;

/**
 * Removes a prefix from a string.
 *
 * @template S - The string to remove the prefix from
 * @template P - The prefix to remove
 * @returns The string with the prefix removed
 */
export type StripPrefix<S extends string, P extends string> = S extends `${P}${infer Rest}` ? Rest : S;

/**
 * Converts a camelCase string to kebab-case.
 *
 * @template S - The string to convert
 * @returns The kebab-case version of the string
 */
export type KebabCase<S extends string> = S extends `${infer Letter}${infer S2}`
  ? S2 extends Uncapitalize<S2>
    ? `${Uncapitalize<Letter>}${KebabCase<S2>}`
    : `${Uncapitalize<Letter>}-${KebabCase<S2>}`
  : S;

/** node is an element. */
export type NodeTypeElement = typeof TYPE_ELEMENT;

/** node is a Text node. */
export type NodeTypeText = typeof TYPE_TEXT_NODE;

/** node is a Comment node. */
export type NodeTypeComment = typeof TYPE_COMMENT_NODE;

/** node is a Document node. */
export type NodeTypeDocument = typeof TYPE_DOCUMENT;
