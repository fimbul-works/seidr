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

/** Prefix used for marker comments */
export const SEIDR_COMPONENT_START_PREFIX = "$";

/** Suffix used for marker comments */
export const SEIDR_COMPONENT_END_PREFIX = "/";

/** Storage type constants */
export const STORAGE_SESSION = "session";
export const STORAGE_LOCAL = "local";

export const ROOT_ATTRIBUTE = "data-seidr-root";

export const TAG_COMMENT = "#comment";
export const TAG_TEXT = "#text";
export const TAG_COMPONENT_PREFIX = "$";

export const DATA_KEY_COMPONENT_STACK = "seidr.component.stack";
export const DATA_KEY_HYDRATION_DATA = "seidr.ssr.hydrationdata";
export const DATA_KEY_HYDRATION_CONTEXT = "seidr.hydration.context";
export const DATA_KEY_SSR_DOCUMENT = "seidr.ssr.document";
export const DATA_KEY_SSR_SCOPE = "seidr.ssr.scope";
