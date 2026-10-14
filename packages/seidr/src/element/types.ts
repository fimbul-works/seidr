import type * as CSS from "csstype";
import type { SeidrComponent } from "../component/types.js";
import type { Ref, Value } from "../observable/types.js";

/**
 * Used to represent DOM API's where users can either pass
 * true or false as a boolean or as its equivalent strings.
 */
export type Booleanish = boolean | "true" | "false";

/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/crossorigin MDN}
 */
export type CrossOrigin = "anonymous" | "use-credentials" | "";

/**
 * All SVG element attributes.
 *
 * Lifted from https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/react/index.d.ts
 * MIT License, Copyright (c) DefinitelyTyped.
 */
export interface SVGAttributes {
  // Attributes which also defined in HTMLAttributes
  className?: string;
  color?: string;
  height?: number | string;
  id?: string;
  lang?: string;
  max?: number | string;
  media?: string;
  method?: string;
  min?: number | string;
  name?: string;
  nonce?: string;
  part?: string;
  slot?: string;
  style: string;
  target?: string;
  type?: string;
  width?: number | string;

  // Other HTML properties supported by SVG elements in browsers
  role?: string;
  tabIndex?: number;
  crossOrigin?: CrossOrigin;

  // SVG Specific attributes
  accentHeight?: number | string;
  accumulate?: "none" | "sum";
  additive?: "replace" | "sum";
  alignmentBaseline?:
    | "auto"
    | "baseline"
    | "before-edge"
    | "text-before-edge"
    | "middle"
    | "central"
    | "after-edge"
    | "text-after-edge"
    | "ideographic"
    | "alphabetic"
    | "hanging"
    | "mathematical"
    | "inherit";
  allowReorder?: "no" | "yes";
  alphabetic?: number | string;
  amplitude?: number | string;
  arabicForm?: "initial" | "medial" | "terminal" | "isolated";
  ascent?: number | string;
  attributeName?: string;
  attributeType?: string;
  autoReverse?: Booleanish;
  azimuth?: number | string;
  baseFrequency?: number | string;
  baselineShift?: number | string;
  baseProfile?: number | string | undefined;
  bbox?: number | string | undefined;
  begin?: number | string | undefined;
  bias?: number | string | undefined;
  by?: number | string | undefined;
  calcMode?: number | string | undefined;
  capHeight?: number | string | undefined;
  clip?: number | string | undefined;
  clipPath?: string | undefined;
  clipPathUnits?: number | string | undefined;
  clipRule?: number | string | undefined;
  colorInterpolation?: number | string | undefined;
  colorInterpolationFilters?: "auto" | "sRGB" | "linearRGB" | "inherit" | undefined;
  colorProfile?: number | string | undefined;
  colorRendering?: number | string | undefined;
  contentScriptType?: number | string | undefined;
  contentStyleType?: number | string | undefined;
  cursor?: number | string | undefined;
  cx?: number | string | undefined;
  cy?: number | string | undefined;
  d?: string | undefined;
  decelerate?: number | string | undefined;
  descent?: number | string | undefined;
  diffuseConstant?: number | string | undefined;
  direction?: number | string | undefined;
  display?: number | string | undefined;
  divisor?: number | string | undefined;
  dominantBaseline?:
    | "auto"
    | "use-script"
    | "no-change"
    | "reset-size"
    | "ideographic"
    | "alphabetic"
    | "hanging"
    | "mathematical"
    | "central"
    | "middle"
    | "text-after-edge"
    | "text-before-edge"
    | "inherit"
    | undefined;
  dur?: number | string | undefined;
  dx?: number | string | undefined;
  dy?: number | string | undefined;
  edgeMode?: number | string | undefined;
  elevation?: number | string | undefined;
  enableBackground?: number | string | undefined;
  end?: number | string | undefined;
  exponent?: number | string | undefined;
  externalResourcesRequired?: Booleanish | undefined;
  fill?: string | undefined;
  fillOpacity?: number | string | undefined;
  fillRule?: "nonzero" | "evenodd" | "inherit" | undefined;
  filter?: string | undefined;
  filterRes?: number | string | undefined;
  filterUnits?: number | string | undefined;
  floodColor?: number | string | undefined;
  floodOpacity?: number | string | undefined;
  focusable?: Booleanish | "auto" | undefined;
  fontFamily?: string | undefined;
  fontSize?: number | string | undefined;
  fontSizeAdjust?: number | string | undefined;
  fontStretch?: number | string | undefined;
  fontStyle?: number | string | undefined;
  fontVariant?: number | string | undefined;
  fontWeight?: number | string | undefined;
  format?: number | string | undefined;
  fr?: number | string | undefined;
  from?: number | string | undefined;
  fx?: number | string | undefined;
  fy?: number | string | undefined;
  g1?: number | string | undefined;
  g2?: number | string | undefined;
  glyphName?: number | string | undefined;
  glyphOrientationHorizontal?: number | string | undefined;
  glyphOrientationVertical?: number | string | undefined;
  glyphRef?: number | string | undefined;
  gradientTransform?: string | undefined;
  gradientUnits?: string | undefined;
  hanging?: number | string | undefined;
  horizAdvX?: number | string | undefined;
  horizOriginX?: number | string | undefined;
  href?: string | undefined;
  ideographic?: number | string | undefined;
  imageRendering?: number | string | undefined;
  in2?: number | string | undefined;
  in?: string | undefined;
  intercept?: number | string | undefined;
  k1?: number | string | undefined;
  k2?: number | string | undefined;
  k3?: number | string | undefined;
  k4?: number | string | undefined;
  k?: number | string | undefined;
  kernelMatrix?: number | string | undefined;
  kernelUnitLength?: number | string | undefined;
  kerning?: number | string | undefined;
  keyPoints?: number | string | undefined;
  keySplines?: number | string | undefined;
  keyTimes?: number | string | undefined;
  lengthAdjust?: number | string | undefined;
  letterSpacing?: number | string | undefined;
  lightingColor?: number | string | undefined;
  limitingConeAngle?: number | string | undefined;
  local?: number | string | undefined;
  markerEnd?: string | undefined;
  markerHeight?: number | string | undefined;
  markerMid?: string | undefined;
  markerStart?: string | undefined;
  markerUnits?: number | string | undefined;
  markerWidth?: number | string | undefined;
  mask?: string | undefined;
  maskContentUnits?: number | string | undefined;
  maskUnits?: number | string | undefined;
  mathematical?: number | string | undefined;
  mode?: number | string | undefined;
  numOctaves?: number | string | undefined;
  offset?: number | string | undefined;
  opacity?: number | string | undefined;
  operator?: number | string | undefined;
  order?: number | string | undefined;
  orient?: number | string | undefined;
  orientation?: number | string | undefined;
  origin?: number | string | undefined;
  overflow?: number | string | undefined;
  overlinePosition?: number | string | undefined;
  overlineThickness?: number | string | undefined;
  paintOrder?: number | string | undefined;
  panose1?: number | string | undefined;
  path?: string | undefined;
  pathLength?: number | string | undefined;
  patternContentUnits?: string | undefined;
  patternTransform?: number | string | undefined;
  patternUnits?: string | undefined;
  pointerEvents?: number | string | undefined;
  points?: string | undefined;
  pointsAtX?: number | string | undefined;
  pointsAtY?: number | string | undefined;
  pointsAtZ?: number | string | undefined;
  preserveAlpha?: Booleanish | undefined;
  preserveAspectRatio?: string | undefined;
  primitiveUnits?: number | string | undefined;
  r?: number | string | undefined;
  radius?: number | string | undefined;
  refX?: number | string | undefined;
  refY?: number | string | undefined;
  renderingIntent?: number | string | undefined;
  repeatCount?: number | string | undefined;
  repeatDur?: number | string | undefined;
  requiredExtensions?: number | string | undefined;
  requiredFeatures?: number | string | undefined;
  restart?: number | string | undefined;
  result?: string | undefined;
  rotate?: number | string | undefined;
  rx?: number | string | undefined;
  ry?: number | string | undefined;
  scale?: number | string | undefined;
  seed?: number | string | undefined;
  shapeRendering?: number | string | undefined;
  slope?: number | string | undefined;
  spacing?: number | string | undefined;
  specularConstant?: number | string | undefined;
  specularExponent?: number | string | undefined;
  speed?: number | string | undefined;
  spreadMethod?: string | undefined;
  startOffset?: number | string | undefined;
  stdDeviation?: number | string | undefined;
  stemh?: number | string | undefined;
  stemv?: number | string | undefined;
  stitchTiles?: number | string | undefined;
  stopColor?: string | undefined;
  stopOpacity?: number | string | undefined;
  strikethroughPosition?: number | string | undefined;
  strikethroughThickness?: number | string | undefined;
  string?: number | string | undefined;
  stroke?: string | undefined;
  strokeDasharray?: string | number | undefined;
  strokeDashoffset?: string | number | undefined;
  strokeLinecap?: "butt" | "round" | "square" | "inherit" | undefined;
  strokeLinejoin?: "miter" | "round" | "bevel" | "inherit" | undefined;
  strokeMiterlimit?: number | string | undefined;
  strokeOpacity?: number | string | undefined;
  strokeWidth?: number | string | undefined;
  surfaceScale?: number | string | undefined;
  systemLanguage?: number | string | undefined;
  tableValues?: number | string | undefined;
  targetX?: number | string | undefined;
  targetY?: number | string | undefined;
  textAnchor?: "start" | "middle" | "end" | "inherit" | undefined;
  textDecoration?: number | string | undefined;
  textLength?: number | string | undefined;
  textRendering?: number | string | undefined;
  to?: number | string | undefined;
  transform?: string | undefined;
  u1?: number | string | undefined;
  u2?: number | string | undefined;
  underlinePosition?: number | string | undefined;
  underlineThickness?: number | string | undefined;
  unicode?: number | string | undefined;
  unicodeBidi?: number | string | undefined;
  unicodeRange?: number | string | undefined;
  unitsPerEm?: number | string | undefined;
  vAlphabetic?: number | string | undefined;
  values?: string | undefined;
  vectorEffect?: number | string | undefined;
  version?: string | undefined;
  vertAdvY?: number | string | undefined;
  vertOriginX?: number | string | undefined;
  vertOriginY?: number | string | undefined;
  vHanging?: number | string | undefined;
  vIdeographic?: number | string | undefined;
  viewBox?: string | undefined;
  viewTarget?: number | string | undefined;
  visibility?: number | string | undefined;
  vMathematical?: number | string | undefined;
  widths?: number | string | undefined;
  wordSpacing?: number | string | undefined;
  writingMode?: number | string | undefined;
  x1?: number | string | undefined;
  x2?: number | string | undefined;
  x?: number | string | undefined;
  xChannelSelector?: string | undefined;
  xHeight?: number | string | undefined;
  xlinkActuate?: string | undefined;
  xlinkArcrole?: string | undefined;
  xlinkHref?: string | undefined;
  xlinkRole?: string | undefined;
  xlinkShow?: string | undefined;
  xlinkTitle?: string | undefined;
  xlinkType?: string | undefined;
  xmlBase?: string | undefined;
  xmlLang?: string | undefined;
  xmlns?: string | undefined;
  xmlnsXlink?: string | undefined;
  xmlSpace?: string | undefined;
  y1?: number | string | undefined;
  y2?: number | string | undefined;
  y?: number | string | undefined;
  yChannelSelector?: string | undefined;
  z?: number | string | undefined;
  zoomAndPan?: string | undefined;
}

/**
 * Tag name map for HTML elements in Seidr.
 *
 * This type is used to define the types of the HTML elements that can be created.
 */
export type SeidrElementTagNameMap = HTMLElementTagNameMap & {
  [K in keyof SVGElementTagNameMap]: SVGAttributes & SVGElement;
};

/**
 * Accepted types for reactive binding to HTML element attributes.
 *
 * Only scalar types (string, number, boolean) can be reactively bound to
 * DOM element properties. Complex objects and arrays require manual binding.
 */
export type Scalar = string | number | boolean;

/**
 * TypeScript utility to check if two types are exactly equal.
 *
 * Used internally to distinguish between readonly and writable properties
 * on HTML elements for reactive binding purposes.
 *
 * @template X - First type to compare
 * @template Y - Second type to compare
 * @template A - Type to return if equal (defaults to X)
 * @template B - Type to return if not equal (defaults to never)
 */
export type IfEquals<X, Y, A = X, B = never> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? A : B;

/**
 * Extracts only the writable (non-readonly) keys from a type.
 *
 * This utility is essential for reactive props because we can only bind
 * to writable DOM element properties. Readonly properties like `id`
 * on some elements or read-only attributes are excluded.
 *
 * @template T - The type to extract writable keys from
 */
export type WritableKeys<T> = {
  [K in keyof T]-?: IfEquals<{ [Q in K]: T[K] }, { -readonly [Q in K]: T[K] }, K>;
}[keyof T];

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
 * Union type representing either a scalar value or a reactive Value observable.
 *
 * This type enables automatic reactive binding - if a property receives a Value
 * observable instance, it will be reactively bound; if it receives a plain value, it will
 * be assigned once.
 *
 * @template T - The underlying scalar type
 */
export type ReactiveValue<T> = [T] extends [Scalar]
  ? T | Value<T> | Value<string> | Value<string | null> | Value<number> | Value<number | null> | Value<boolean> | true
  : [T] extends [infer A]
    ? T | Value<A> | null
    : T;

/**
 * Type definition for reactive HTML element properties.
 *
 * Maps all writable scalar properties of an HTML element to accept either
 * the original type or a Value observable of that type. This enables automatic
 * reactive binding without additional API calls.
 *
 * @template K - The tag name from SeidrElementTagNameMap
 * @template T - The corresponding HTML element type
 */
export type ReactiveProps<
  K extends keyof SeidrElementTagNameMap,
  T extends SeidrElementTagNameMap[K] = SeidrElementTagNameMap[K],
> = {
  [K in WritableKeys<Omit<T, "style">>]?: ReactiveValue<T[K]>;
};

/**
 * Type definition for reactive ARIA attributes.
 *
 * Maps all writable scalar properties of an HTML element to accept either
 * the original type or a Value observable of that type. This enables automatic
 * reactive binding without additional API calls.
 */
export type ReactiveARIAMixin = {
  [K in keyof ARIAMixin]-?: ReactiveValue<ARIAMixin[K]>;
};

/**
 * Type definition for reactive aria-* attributes.
 */
export type ReactiveARIAKebabCase = {
  [K in `aria-${string}`]?: ReactiveValue<string>;
};

/**
 * Type definition for reactive CSS style properties.
 */
export type ReactiveStyleDeclaration = Partial<{
  [K in keyof CSS.Properties<string | number>]-?: ReactiveValue<CSS.Properties<string | number>[K]>;
}>;

/**
 * Type definition for reactive data-* attributes.
 */
export type ReactiveDataKebabCase = {
  [K in `data-${string}`]?: ReactiveValue<string>;
};

/**
 * Reactive camelCase props type.
 * It uses a "Template Literal Index Signature" to allow any
 * valid-looking camelCase key dynamically.
 */
export type ReactiveDataCamelCase = {
  [K in `data${string}`]: IsCamelCase<K> extends true ? ReactiveValue<string> : never;
};

/**
 * Props for Seidr HTML elements.
 *
 * @template {keyof SeidrElementTagNameMap} K - Element tag name type
 */
export type SeidrElementProps<K extends keyof SeidrElementTagNameMap = keyof SeidrElementTagNameMap> = Partial<
  ReactiveProps<K, SeidrElementTagNameMap[K]> &
    ReactiveARIAMixin &
    ReactiveARIAKebabCase &
    ReactiveDataKebabCase &
    ReactiveDataCamelCase
> & { style?: ReactiveStyleDeclaration | ReactiveValue<string>; ref?: Ref<SeidrElementTagNameMap[K]> };

/**
 * Union type representing allowed nodes for Seidr elements.
 */
export type SeidrNode = SeidrComponent | Element | Text | Comment;

/**
 * Union type representing allowed child nodes for Seidr Components.
 */
export type SeidrChild = SeidrNode | Value | ChildNode | string | number | boolean | null | undefined | SeidrChild[];

/**
 * Namee of a property
 */
export type PropName<K extends keyof SeidrElementTagNameMap = any> =
  | keyof HTMLElement
  | keyof SeidrElementTagNameMap[K]
  | `data${string}`
  | `data-${string}`
  | `aria${string}`
  | `aria-${string}`
  | keyof ARIAMixin
  | "class"
  | "for"
  | "ref"
  | "htmlFor";
