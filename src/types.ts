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

/**
 * Internal Symbol used for recursive lifecycle cleanup.
 * This allows Seidr to trigger cleanup on detached sub-trees without
 * performing DOM detachment on every individual node.
 */
export const SEIDR_CLEANUP = Symbol("SeidrCleanup");

/**
 * Property name for Seidr type identification.
 */
export const TYPE_PROP = "$type";

/**
 * Seidr internal object types.
 */
export const TYPE = {
  ELEMENT: "el",
  COMPONENT: "comp",
  FRAGMENT: "frag",
  COMPONENT_FACTORY: "factory",
} as const;
