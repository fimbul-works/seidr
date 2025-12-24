import { Seidr } from "../seidr.js";
import type { CleanupFunction } from "../types.js";
import { ServerHTMLElement } from "./ssr/server-html-element.js";

// SSR detection function: true if window is undefined (Node.js) or if test flag is set
const isServerSide = () => typeof window === "undefined" || process.env.SEIDR_TEST_SSR === "true";

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
export type ReactiveProps<K extends keyof HTMLElementTagNameMap, T extends Omit<HTMLElementTagNameMap[K], "style">> = {
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
 * import { createElement, Seidr, elementClassToggle } from '@fimbul-works/seidr';
 *
 * const isActive = new Seidr(false);
 * const button = createElement('button', { textContent: 'Click me' });
 *
 * // Event handling with cleanup
 * const cleanup = button.on('click', () => console.log('clicked'));
 *
 * // Reactive class binding (utility function)
 * elementClassToggle(button, 'active', isActive);
 *
 * // Cleanup when done
 * button.destroy(); // Removes event listeners and bindings
 * ```
 */
export interface SeidrElementInterface {
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
   * Remove all child elements.
   */
  clear(): void;

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
   * import { toggleClass } from '@fimbul-works/seidr';
   *
   * // Create element with event listeners and reactive bindings
   * const button = createElement('button');
   * button.on('click', handleClick);
   * toggleClass(button, 'active', isActive);
   *
   * // Clean up everything when done
   * button.destroy();
   * ```
   */
  destroy(): void;

  style: CSSStyleDeclaration | string;
}

/**
 * TODO: describe the type
 */
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
 * @throws {Error} When attempting to use reserved properties ('on', 'destroy')
 */
export const $ = <K extends keyof HTMLElementTagNameMap, P extends keyof HTMLElementTagNameMap[K]>(
  tagName: K,
  props?: Partial<ReactiveProps<K, HTMLElementTagNameMap[K]> | ReactiveARIAMixin>,
  children?: (SeidrNode | (() => SeidrNode))[],
): SeidrElement<K> => {
  // Handle SSR element
  if (isServerSide()) {
    const el = new ServerHTMLElement(tagName, {}, []);

    // Process props with reactive bindings
    let cleanups: (() => void)[] = [];
    if (props) {
      for (const [prop, value] of Object.entries(props)) {
        if (["on", "destroy"].includes(prop)) {
          throw new Error(`Unallowed property "${prop}"`);
        }

        // Properties that should be set directly on the element
        const directProps: Set<string> = new Set([
          "id",
          "className",
          "textContent",
          "innerHTML",
          "value",
          "checked",
          "disabled",
          "readonly",
          "required",
          "type",
          "href",
          "src",
          "style",
        ]);

        if (value instanceof Seidr) {
          // Set up reactive binding
          const propKey = prop as string;
          cleanups.push(
            value.bind(el, (value, element) => {
              if (directProps.has(propKey)) {
                (element as any)[propKey] = value;
              } else {
                (element as ServerHTMLElement).setAttribute(propKey, String(value));
              }
            }),
          );
          // Set initial value
          if (directProps.has(prop)) {
            (el as any)[prop] = value.value;
          } else {
            el.setAttribute(prop, String(value.value));
          }
        } else {
          // Non-reactive value
          if (directProps.has(prop)) {
            (el as any)[prop] = value;
          } else {
            el.setAttribute(prop, String(value));
          }
        }
      }
    }

    // Process children - evaluate Seidr objects and call functions
    if (Array.isArray(children)) {
      children.forEach((child) => {
        if (typeof child === "function") {
          const result = child();
          if (result instanceof Seidr) {
            // For Seidr children, we need to create a text node and bind to it
            const textSpan = new ServerHTMLElement("span", {}, []);
            cleanups.push(
              result.bind(textSpan, (value) => {
                textSpan.textContent = String(value);
              }),
            );
            textSpan.textContent = String(result.value);
            el.appendChild(textSpan);
          } else {
            el.appendChild(result as any);
          }
        } else if (child instanceof Seidr) {
          // Seidr child - create a text node with binding
          const textSpan = new ServerHTMLElement("span", {}, []);
          cleanups.push(
            child.bind(textSpan, (value) => {
              textSpan.textContent = String(value);
            }),
          );
          textSpan.textContent = String(child.value);
          el.appendChild(textSpan);
        } else {
          el.appendChild(child as any);
        }
      });
    }

    // Store cleanup method
    const originalDestroy = el.destroy.bind(el);
    el.destroy = () => {
      cleanups.forEach((cleanup) => cleanup());
      cleanups = [];
      originalDestroy();
    };

    // @ts-expect-error
    return el;
  }

  const el = document.createElement(tagName);
  let cleanups: (() => void)[] = [];

  // Assign properties
  if (props) {
    for (const [prop, value] of Object.entries(props)) {
      if (["on", "clear", "destroy"].includes(prop)) {
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
    clear(): void {
      Array.from(el.children).forEach((child: any) => (child.isSeidrElement ? child.destroy() : child.remove()));
    },
    destroy(): void {
      this.clear();
      cleanups.forEach((cleanup) => cleanup());
      cleanups = [];
      el.remove();
    },
  } as SeidrElementInterface);

  // Append children
  if (Array.isArray(children)) {
    children.forEach((child) => el.appendChild(typeof child === "function" ? child() : child));
  }

  return el as SeidrElement<K>;
};
