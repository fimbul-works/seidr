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

/** Prefix used for marker comments. */
export const SEIDR_COMPONENT_START_PREFIX = "$";

/** Suffix used for marker comments. */
export const SEIDR_COMPONENT_END_PREFIX = "/";

/** Root element data attribute. */
export const ROOT_ATTRIBUTE = "data-seidr-root";

/** Comment tag. */
export const TAG_COMMENT = "#comment";

/** Text tag. */
export const TAG_TEXT = "#text";

/** Component tag prefix. */
export const TAG_COMPONENT_PREFIX = "$";

/** Component scope data key. */
export const DATA_KEY_COMPONENT_SCOPE = "seidr.component-scope";

/** Hydration data key. */
export const DATA_KEY_HYDRATION_DATA = "seidr.hydration.data";

/** Hydration context key. */
export const DATA_KEY_HYDRATION_CONTEXT = "seidr.hydration.context";

/** Document data key. */
export const DATA_KEY_DOCUMENT = "seidr.document";

/** SSR scope data key. */
export const DATA_KEY_SSR_SCOPE = "seidr.ssr.scope";

/** Boolean attributes. */
export const BOOL_ATTRIBUTES = new Set([
  "allowfullscreen",
  "async",
  "autofocus",
  "autoplay",
  "checked",
  "compact",
  "controls",
  "default",
  "defer",
  "disabled",
  "formnovalidate",
  "hidden",
  "ismap",
  "loop",
  "multiple",
  "muted",
  "nomodule",
  "noresize",
  "noshade",
  "novalidate",
  "open",
  "playsinline",
  "readonly",
  "required",
  "reversed",
  "selected",
  "truespeed",
]);
