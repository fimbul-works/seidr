/** Node is an element. */
export const TYPE_ELEMENT = 1;

/** Node is a Text node. */
export const TYPE_TEXT_NODE = 3;

/** Node is a Comment node. */
export const TYPE_COMMENT_NODE = 8;

/** Node is a Document node. */
export const TYPE_DOCUMENT = 9;

/** Seidr component. */
export const TYPE_COMPONENT = 100;

/** Seidr component factory. */
export const TYPE_COMPONENT_FACTORY = 101;

/** Seidr type property. */
export const TYPE_PROP = "$type";

/** Seidr cleanup function. */
export const SEIDR_CLEANUP = Symbol("seidrCleanup");

/** Prefix used for marker comments */
export const SEIDR_COMPONENT_START_PREFIX = "";

/** Suffix used for marker comments */
export const SEIDR_COMPONENT_END_PREFIX = "/";
