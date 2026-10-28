import type * as CSS from "csstype";
import type { SeidrComponent } from "../component/types.js";
import type { ObservableValue, Ref, Value } from "../observable/types.js";

// import type { SVGAttributes } from "./types.svg.js";

/**
 * Check if two types are exactly equal.
 *
 * @template X - First type to compare
 * @template Y - Second type to compare
 * @template A - Type to return if equal (defaults to X)
 * @template B - Type to return if not equal (defaults to never)
 */
type IfEquals<X, Y, A = X, B = never> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? A : B;

/**
 * Extracts only the writable (non-readonly) keys from a type.
 *
 * @template T - The type to extract writable keys from
 */
type WritableKeys<T> = {
  [K in keyof T]-?: IfEquals<{ [Q in K]: T[K] }, { -readonly [Q in K]: T[K] }, K>;
}[keyof T];

/**
 * Converts the given string from camel-case to kebab-case.
 *
 * @template S - The string to convert.
 * @returns The kebab-case version of the string.
 */
type CamelToKebab<S extends string> = S extends `${infer T}${infer U}`
  ? U extends Uncapitalize<U>
    ? `${Uncapitalize<T>}${CamelToKebab<U>}`
    : `${Uncapitalize<T>}-${CamelToKebab<U>}`
  : "";

/**
 * Tag name map for HTML elements in Seidr.
 *
 * This type is used to define the types of the HTML elements that can be created.
 */
export type SeidrElementTagNameMap = HTMLElementTagNameMap;

// export type SeidrElementTagNameMap = HTMLElementTagNameMap & {
//   [K in keyof SVGElementTagNameMap]: SVGAttributes & SVGElement;
// };

/**
 * Union type representing either a scalar value or a reactive Value observable.
 *
 * @template T - The underlying type
 */
export type ReactiveValue<T> = [T] extends [boolean]
  ? boolean | ObservableValue<boolean>
  : [T] extends [infer A]
    ? A | ObservableValue<A>
    : T | ObservableValue<T | null | undefined>;

/**
 * Type definition for reactive ARIA mixin properties.
 */
export type ReactiveARIAMixin = Partial<
  { [K in keyof ARIAMixin]-?: ReactiveValue<ARIAMixin[K]> } & {
    [key: `aria-${string}`]: ReactiveValue<string | undefined> | ObservableValue<string | undefined> | undefined;
  }
>;

/**
 * Type definition for reactive HTML element properties.
 *
 * @template K - The tag name from SeidrElementTagNameMap
 * @template T - The corresponding HTML element type
 */
export type ReactiveProps<
  K extends keyof SeidrElementTagNameMap,
  T extends SeidrElementTagNameMap[K] = SeidrElementTagNameMap[K],
> = {
  [K in WritableKeys<Omit<T, "style">>]?: ReactiveValue<T[K]> | ObservableValue<T[K] | undefined>;
};

/**
 * Type definition for CSS properties (omitting length).
 */
export type CSSProperties = CSS.Properties<string | number>;

/**
 * Type definition for reactive CSS style properties.
 */
export type ReactiveStyleDeclaration = Partial<{
  [K in keyof CSSProperties]-?: ReactiveValue<CSSProperties[K]>;
}>;

/**
 * Props for Seidr HTML elements.
 *
 * @template K - Element tag name type
 */
export type SeidrElementProps<K extends keyof SeidrElementTagNameMap = keyof SeidrElementTagNameMap> = Partial<
  ReactiveProps<K, SeidrElementTagNameMap[K]> & GlobalEventHandlers
> & {
  /**
   * ID attribute.
   */
  id?: ReactiveValue<string> | ObservableValue<string | undefined>;

  /**
   * Ref handle.
   */
  ref?: Ref<SeidrElementTagNameMap[K]>;

  /**
   * Used to force mounting when more control is needed (e.g. for CSS transitions).
   * When true or reactive truthy, the element is always rendered.
   */
  forceMount?: Value<boolean>;

  /**
   * Reactive styles.
   */
  style?: ReactiveStyleDeclaration;

  /**
   * Reactive data attributes.
   */
  [key: `data${string}`]: ReactiveValue<string> | ObservableValue<string | undefined> | undefined;

  /**
   * Reactive aria attributes.
   */
  [key: `aria-${string}`]: ReactiveValue<string> | ObservableValue<string | undefined> | undefined;
};

/**
 * Union type representing allowed nodes for Seidr elements.
 */
export type SeidrNode = SeidrComponent | Element | Text | Comment;

/**
 * Union type representing allowed child nodes for Seidr Components.
 */
export type SeidrChild =
  | SeidrNode
  | ObservableValue
  | ChildNode
  | string
  | number
  | boolean
  | null
  | undefined
  | SeidrChild[];

/**
 * Namee of a property
 */
export type PropName<K extends keyof SeidrElementTagNameMap = any> =
  | keyof HTMLElement
  | keyof SeidrElementTagNameMap[K]
  | keyof ARIAMixin
  | CamelToKebab<keyof ARIAMixin>
  | `data${string}`
  | "class"
  | "for"
  | "ref"
  | "htmlFor";
