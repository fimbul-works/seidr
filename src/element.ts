import { type CleanupFunction, Seidr } from "./seidr.js";

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
 * Union type representing either a scalar value or a reactive Seidr observable.
 *
 * This type enables automatic reactive binding - if a property receives a Seidr
 * instance, it will be reactively bound; if it receives a plain value, it will
 * be assigned once.
 *
 * @template T - The underlying scalar type
 */
export type ReactiveValue<T> = [T] extends string ? T | Seidr<Scalar> : [T] extends [Scalar] ? T | Seidr<T> : T;

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
export type ReactiveProps<K extends keyof HTMLElementTagNameMap, T extends HTMLElementTagNameMap[K]> = {
  [K in WritableKeys<T>]?: ReactiveValue<T[K]>;
};

/**
 * Type definition for reactive ARIA attributes.
 *
 * Maps all writable scalar properties of an HTML element to accept either
 * the original type or a Seidr observable of that type. This enables automatic
 * reactive binding without additional API calls.
 *
 * @template K - The key for ARIAMixin attribute
 */
export type ReactiveARIAMixin = {
  [K in keyof WritableKeys<ARIAMixin>]?: ReactiveValue<WritableKeys<ARIAMixin>[K]>;
};

/**
 * Union type representing allowed child nodes for Seidr elements.
 *
 * Children can be regular DOM elements, Seidr-enhanced elements, or text nodes.
 * This type ensures type safety when building DOM structures.
 */
export type SeidrNode = SeidrElement<keyof HTMLElementTagNameMap> | Element | Text;

/**
 * Enhanced HTMLElement interface with Seidr-specific functionality.
 *
 * SeidrElement extends the standard HTMLElement with additional methods for
 * reactive programming, event handling, and lifecycle management. All elements
 * created with createElement() automatically implement this interface.
 *
 * @example
 * Using SeidrElement methods
 * ```typescript
 * import { createElement, Seidr } from '@fimbul-works/seidr';
 *
 * const isActive = new Seidr(false);
 * const button = createElement('button', { textContent: 'Click me' });
 *
 * // Event handling with cleanup
 * const cleanup = button.on('click', () => console.log('clicked'));
 *
 * // Reactive class binding
 * button.toggleClass('active', isActive);
 *
 * // Cleanup when done
 * button.destroy(); // Removes event listeners and class bindings
 * ```
 */
export interface SeidrElementInterface extends Omit<Element, "style"> {
  /**
   * Read-only identifier for Seidr-enhanced elements.
   *
   * This property can be used to quickly identify if an element was created
   * by Seidr and has the enhanced functionality available.
   */
  readonly isSeidrElement: true;

  /**
   * Adds an event listener with automatic cleanup functionality.
   *
   * Unlike addEventListener(), this method returns a cleanup function
   * that removes the event listener. This integrates with Seidr's
   * component lifecycle and resource management system.
   *
   * @template E - The event type from HTMLElementEventMap
   *
   * @param event - The event type to listen for
   * @param handler - The event handler function
   * @param options - Optional event listener options
   *
   * @returns A cleanup function that removes the event listener
   *
   * @example
   * Event handling with cleanup
   * ```typescript
   * const cleanup = element.on('click', (e) => {
   *   console.log('Element clicked:', e);
   * });
   *
   * // Later, clean up the event listener
   * cleanup();
   *
   * // Or let destroy() handle it automatically
   * element.destroy();
   * ```
   */
  on<E extends keyof HTMLElementEventMap>(
    event: E,
    handler: (ev: HTMLElementEventMap[E]) => any,
    options?: boolean | AddEventListenerOptions,
  ): CleanupFunction;

  /**
   * Removes the element from the DOM and cleans up all resources.
   *
   * This method performs comprehensive cleanup:
   * - Removes the element from its parent
   * - Destroys all child elements (recursively)
   * - Removes all event listeners
   * - Cleans up all reactive bindings
   * - Executes all registered cleanup functions
   *
   * @example
   * Manual cleanup
   * ```typescript
   * // Create element with event listeners and reactive bindings
   * const button = createElement('button');
   * button.on('click', handleClick);
   * button.toggleClass('active', isActive);
   *
   * // Clean up everything when done
   * button.destroy();
   * ```
   */
  destroy(): void;

  /**
   * Reactively toggles a CSS class based on a boolean observable.
   *
   * Creates a reactive binding between a Seidr boolean and a CSS class.
   * When the observable is true, the class is added; when false, it's removed.
   * The binding is automatically cleaned up when the element is destroyed.
   *
   * @param className - The CSS class name to toggle
   * @param observable - Boolean Seidr that controls the class
   *
   * @returns A cleanup function that removes the binding when called
   *
   * @example
   * Basic reactive class toggling
   * ```typescript
   * import { createElement, Seidr } from '@fimbul-works/seidr';
   *
   * const isActive = new Seidr(false);
   * const button = createElement('button', { textContent: 'Toggle Me' });
   *
   * // Bind class to observable
   * button.toggleClass('active', isActive);
   *
   * isActive.value = true; // Adds 'active' class
   * isActive.value = false; // Removes 'active' class
   * ```
   *
   * @example
   * Multiple class bindings
   * ```typescript
   * const isVisible = new Seidr(true);
   * const hasError = new Seidr(false);
   * const isLoading = new Seidr(false);
   *
   * const element = createElement('div');
   *
   * // Multiple reactive class bindings
   * element.toggleClass('visible', isVisible);
   * element.toggleClass('error', hasError);
   * element.toggleClass('loading', isLoading);
   * ```
   */
  toggleClass(className: string, observable: Seidr<boolean>): CleanupFunction;

  style: CSSStyleDeclaration | string;
}

export type SeidrElement<K extends keyof HTMLElementTagNameMap = keyof HTMLElementTagNameMap> = SeidrElementInterface &
  HTMLElementTagNameMap[K];

/**
 * Creates an HTML element with automatic reactive binding capabilities.
 *
 * When a property value is a Seidr instance, it automatically creates a reactive
 * binding that updates the DOM property whenever the observable changes. Plain
 * values are assigned once without creating bindings.
 *
 * @template K - The HTML tag name from HTMLElementTagNameMap
 * @template P - Property type inference (internal use)
 *
 * @param tagName - The HTML tag name to create
 * @param props - Element properties supporting reactive bindings
 * @param children - Child elements or functions returning elements
 *
 * @returns A Seidr-enhanced HTML element with additional methods
 *
 * @example
 * Basic element creation
 * ```typescript
 * import { createElement } from '@fimbul-works/seidr';
 *
 * const button = createElement('button', {
 *   textContent: 'Click me',
 *   className: 'btn btn-primary'
 * });
 * ```
 *
 * @example
 * Reactive property binding
 * ```typescript
 * import { createElement, Seidr } from '@fimbul-works/seidr';
 *
 * const isActive = new Seidr(false);
 * const count = new Seidr(0);
 *
 * const button = createElement('button', {
 *   disabled: isActive, // Reactive disabled property
 *   textContent: count.as(c => `Count: ${c}`), // Reactive text content
 *   className: 'btn', // Static property
 *   onclick: () => count.value++ // Event handler
 * });
 *
 * // DOM updates automatically when observables change
 * isActive.value = true; // Button becomes disabled
 * count.value = 5; // Button text updates to "Count: 5"
 * ```
 *
 * @example
 * With children elements
 * ```typescript
 * const container = createElement('div', { className: 'container' }, [
 *   createElement('h1', { textContent: 'Title' }),
 *   createElement('p', { textContent: 'Description' }),
 *   () => createElement('button', { textContent: 'Dynamic' }) // Function child
 * ]);
 * ```
 *
 * @example
 * Complex reactive bindings
 * ```typescript
 * import { createElement, Seidr } from '@fimbul-works/seidr';
 *
 * const theme = new Seidr<'light' | 'dark'>('light');
 * const isLoading = new Seidr(false);
 *
 * const card = createElement('div', {
 *   className: theme.as(t => `card theme-${t}`),
 *   style: isLoading.as(loading => `opacity: ${loading ? 0.5 : 1}`),
 *   'aria-busy': isLoading // Reactive boolean attribute
 * });
 * ```
 *
 * @throws {Error} When attempting to use reserved properties ('on', 'destroy', 'toggleClass')
 */
export const createElement = <K extends keyof HTMLElementTagNameMap, P extends keyof HTMLElementTagNameMap[K]>(
  tagName: K,
  props?: Partial<ReactiveProps<K, HTMLElementTagNameMap[K]> | ReactiveARIAMixin>,
  children?: (SeidrNode | (() => SeidrNode))[],
): SeidrElement<K> => {
  const el = document.createElement(tagName);
  const cleanups: (() => void)[] = [];

  // Assign properties
  if (props) {
    for (const [prop, value] of Object.entries(props)) {
      if (["on", "destroy", "toggleClass"].includes(prop)) {
        throw new Error(`Unallowed property "${prop}"`);
      }

      if (value instanceof Seidr) {
        cleanups.push(value.bind(el, (value, el) => (el[prop as P] = value)));
      } else {
        el[prop as P] = value as HTMLElementTagNameMap[K][P];
      }
    }
  }

  // Add extra features
  Object.assign(el, {
    get isSeidrElement() {
      return true;
    },
    on<E extends keyof HTMLElementEventMap>(
      event: E,
      handler: (ev: HTMLElementEventMap[E]) => any,
      options?: boolean | AddEventListenerOptions,
    ): CleanupFunction {
      el.addEventListener(event, handler as EventListener, options);
      return () => el.removeEventListener(event, handler as EventListener, options);
    },
    destroy(): void {
      Array.from(el.children).forEach((child: any) => child.destroy?.());
      cleanups.forEach((cleanup) => cleanup());
      el.remove();
    },
    toggleClass(className: string, observable: Seidr<boolean>) {
      return observable.bind(el, (value, el) => el.classList.toggle(className, value));
    },
  });

  // Append children
  if (Array.isArray(children)) {
    children.forEach((child) => el.appendChild(typeof child === "function" ? child() : child));
  }

  return el as SeidrElement<K>;
};

export const $ = createElement;
