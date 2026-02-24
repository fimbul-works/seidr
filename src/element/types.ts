import type { Component } from "../component/types";
import type { Seidr } from "../seidr";

/**
 * Accepted types for reactive binding to HTML element attributes.
 *
 * Only scalar types (string, number, boolean) can be reactively bound to
 * DOM element properties. Complex objects and arrays require manual binding.
 */
type Scalar = string | number | boolean;

/**
 * Advanced TypeScript utility to check if two types are exactly equal.
 *
 * Used internally to distinguish between readonly and writable properties
 * on HTML elements for reactive binding purposes.
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
 * This utility is essential for reactive props because we can only bind
 * to writable DOM element properties. Readonly properties like `id`
 * on some elements or read-only attributes are excluded.
 *
 * @template T - The type to extract writable keys from
 */
type WritableKeys<T> = {
  [K in keyof T]-?: IfEquals<{ [Q in K]: T[K] }, { -readonly [Q in K]: T[K] }, K>;
}[keyof T];

/**
 * Checks if a string is in camelCase.
 *
 * @template S - The string to check
 * @returns true if the string is in camelCase, false otherwise
 */
type IsCamelCase<S extends string> = S extends `${string}${"-" | "_"}${string}`
  ? false
  : S extends `${infer First}${string}`
    ? First extends Lowercase<First>
      ? true
      : false
    : false;

/**
 * Removes the `style` property from a type.
 *
 * @template T - The type to remove the `style` property from
 */
type NoStyle<T> = Omit<T, "style">;

/**
 * Union type representing either a scalar value or a reactive Seidr observable.
 *
 * This type enables automatic reactive binding - if a property receives a Seidr
 * instance, it will be reactively bound; if it receives a plain value, it will
 * be assigned once.
 *
 * @template T - The underlying scalar type
 */
export type ReactiveValue<T> = [T] extends [Scalar]
  ? T | Seidr<string> | Seidr<string | null> | Seidr<number> | Seidr<number | null> | Seidr<boolean>
  : [T] extends [infer A]
    ? T | Seidr<A> | null
    : T;

/**
 * Type definition for reactive HTML element properties.
 *
 * Maps all writable scalar properties of an HTML element to accept either
 * the original type or a Seidr observable of that type. This enables automatic
 * reactive binding without additional API calls.
 *
 * @template K - The HTML tag name from HTMLElementTagNameMap
 * @template T - The corresponding HTML element type
 */
export type ReactiveProps<
  K extends keyof HTMLElementTagNameMap,
  T extends HTMLElementTagNameMap[K] = HTMLElementTagNameMap[K],
> = {
  [K in WritableKeys<NoStyle<T>>]?: ReactiveValue<T[K]>;
};

/**
 * Type definition for reactive ARIA attributes.
 *
 * Maps all writable scalar properties of an HTML element to accept either
 * the original type or a Seidr observable of that type. This enables automatic
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
export type ReactiveCSSStyleDeclaration = Partial<{
  [K in keyof CSSStyleDeclaration]-?: ReactiveValue<CSSStyleDeclaration[K]>;
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
 * @template {keyof HTMLElementTagNameMap} K - The HTML tag name from HTMLElementTagNameMap
 */
export type SeidrElementProps<K extends keyof HTMLElementTagNameMap = keyof HTMLElementTagNameMap> = Partial<
  ReactiveProps<K, HTMLElementTagNameMap[K]> &
    ReactiveARIAMixin &
    ReactiveARIAKebabCase &
    ReactiveDataKebabCase &
    ReactiveDataCamelCase
> & { style?: ReactiveCSSStyleDeclaration | string | Seidr<string> };

/**
 * Union type representing allowed nodes for Seidr elements.
 */
export type SeidrNode = Component | Element | Text | Comment;

/**
 * Union type representing allowed child nodes for Seidr elements.
 */
export type SeidrChild = SeidrNode | string | null | undefined;
