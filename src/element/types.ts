import type { SeidrComponent } from "../component/types";
import { SEIDR_CLEANUP, type TYPE_ELEMENT, TYPE_PROP } from "../constants";
import type { Seidr } from "../seidr";
import type { CleanupFunction, IsCamelCase } from "../types";

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
 * Removes the `style` property from a type.
 *
 * @template T - The type to remove the `style` property from
 */
type NoStyle<T> = Omit<T, "style">;

/**
 * Type definition for reactive CSS style properties.
 */
type FlexibleCSSStyleDeclaration = Partial<CSSStyleDeclaration>;

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
export type ReactiveCamelCaseProps = {
  [K in string]: IsCamelCase<K> extends true ? ReactiveValue<string> : never;
};

/**
 * Props for SeidrElement.
 *
 * @template {keyof HTMLElementTagNameMap} K - The HTML tag name from HTMLElementTagNameMap
 */
export type SeidrElementProps<K extends keyof HTMLElementTagNameMap = keyof HTMLElementTagNameMap> = Partial<
  ReactiveProps<K, HTMLElementTagNameMap[K]> & ReactiveARIAMixin & ReactiveARIAKebabCase & ReactiveDataKebabCase
> & { style?: ReactiveCSSStyleDeclaration | string | Seidr<string> };

/**
 * Union type representing allowed nodes for Seidr elements.
 */
export type SeidrNode = SeidrComponent | SeidrElement<any> | Element | Text | Comment;

/**
 * Union type representing allowed child nodes for Seidr elements.
 */
export type SeidrChild = SeidrNode | string | null | undefined;

/**
 * Enhanced HTMLElement interface with Seidr-specific functionality.
 *
 * SeidrElement extends the standard HTMLElement with additional methods for
 * reactive programming, event handling, and lifecycle management. All elements
 * created with $() automatically implement this interface.
 */
export interface SeidrElementInterface {
  /**
   * Read-only identifier for Seidr-enhanced elements.
   *
   * This property can be used to quickly identify if an element was created
   * by Seidr and has the enhanced functionality available.
   * @type {typeof TYPE.ELEMENT}
   */
  readonly [TYPE_PROP]: typeof TYPE_ELEMENT;

  /**
   * Adds an event listener with automatic cleanup functionality.
   *
   * Unlike addEventListener(), this method returns a cleanup function
   * that removes the event listener. This integrates with Seidr's
   * component lifecycle and resource management system.
   *
   * @template {keyof HTMLElementEventMap} E - The event type from HTMLElementEventMap
   *
   * @param {E} event - The event type to listen for
   * @param {(ev: HTMLElementEventMap[E]) => void} handler - The event handler function
   * @param {boolean | AddEventListenerOptions} [options] - Optional event listener options
   * @returns {CleanupFunction} A cleanup function that removes the event listener
   */
  on<E extends keyof HTMLElementEventMap>(
    event: E,
    handler: (ev: HTMLElementEventMap[E]) => void,
    options?: boolean | AddEventListenerOptions,
  ): CleanupFunction;

  /**
   * Remove all child elements.
   */
  clear(): void;

  [SEIDR_CLEANUP]: CleanupFunction;
}

/**
 * SeidrElement is an enhanced HTMLElement.
 * @template {keyof HTMLElementTagNameMap} K - The HTML tag name from HTMLElementTagNameMap
 */
export type SeidrElement<K extends keyof HTMLElementTagNameMap = keyof HTMLElementTagNameMap> = SeidrElementInterface &
  NoStyle<HTMLElementTagNameMap[K]> & { style: FlexibleCSSStyleDeclaration };
