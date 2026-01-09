import { applyElementBindings } from "../../ssr/hydration-context";
import { ServerHTMLElement } from "../../ssr/server-html-element";
import { getActiveSSRScope } from "../../ssr/ssr-scope";
import { getRenderContext } from "../render-context-contract";
import type { Seidr } from "../seidr";
import { isFn, isSeidr, isStr, isUndef } from "../util/is";
import { $query } from "./query/query";

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
export type SeidrNode = SeidrElement<keyof HTMLElementTagNameMap> | Element | Text | string;

/**
 * Enhanced HTMLElement interface with Seidr-specific functionality.
 *
 * SeidrElement extends the standard HTMLElement with additional methods for
 * reactive programming, event handling, and lifecycle management. All elements
 * created with $() automatically implement this interface.
 *
 * @example
 * Using SeidrElement methods
 * ```typescript
 * import { $, Seidr, elementClassToggle } from '@fimbul-works/seidr';
 *
 * const isActive = new Seidr(false);
 * const button = $('button', { textContent: 'Click me' });
 *
 * // Event handling with cleanup
 * const cleanup = button.on('click', () => console.log('clicked'));
 *
 * // Reactive class binding (utility function)
 * elementClassToggle(button, 'active', isActive);
 *
 * // Cleanup when done
 * button.remove(); // Removes event listeners and bindings
 * ```
 */
export interface SeidrElementInterface {
  /**
   * Read-only identifier for Seidr-enhanced elements.
   *
   * This property can be used to quickly identify if an element was created
   * by Seidr and has the enhanced functionality available.
   * @type {true}
   */
  readonly isSeidrElement: true;

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
   * // Or let remove() handle it automatically
   * element.remove();
   * ```
   */
  on<E extends keyof HTMLElementEventMap>(
    event: E,
    handler: (ev: HTMLElementEventMap[E]) => void,
    options?: boolean | AddEventListenerOptions,
  ): () => void;

  /**
   * Remove all child elements.
   */
  clear(): void;

  /**
   * Removes the element from the DOM and cleans up all bindings.
   *
   * @example
   * Manual cleanup
   * ```typescript
   * import { toggleClass } from '@fimbul-works/seidr';
   *
   * // Create element with event listeners and reactive bindings
   * const button = $('button');
   * button.on('click', handleClick);
   * toggleClass(button, 'active', isActive);
   *
   * // Clean up everything when done
   * button.remove();
   * ```
   */
  remove(): void;
}

/**
 * SeidrElement is an enhanced HTMLElement.
 * @template {keyof HTMLElementTagNameMap} K - The HTML tag name from HTMLElementTagNameMap
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
 * @template {keyof HTMLElementTagNameMap} K - The HTML tag name from HTMLElementTagNameMap
 * @template {keyof HTMLElementTagNameMap[K]} P - Property type inference (internal use)
 *
 * @param {K} tagName - The HTML tag name to create
 * @param {Partial<ReactiveProps<K, HTMLElementTagNameMap[K]> | ReactiveARIAMixin>} [props] - Element properties supporting reactive bindings
 * @param {(SeidrNode | (() => SeidrNode))[]} [children] - Child elements or functions returning elements
 * @returns {SeidrElement<K>} A Seidr-enhanced HTML element with additional methods
 * @throws {Error} When attempting to use reserved properties ('on', 'clear', 'destroy')
 *
 * @example
 * Basic element creation
 * ```typescript
 * import { $ } from '@fimbul-works/seidr';
 *
 * const button = $('button', {
 *   textContent: 'Click me',
 *   className: 'btn btn-primary'
 * });
 * ```
 *
 * @example
 * Reactive property binding
 * ```typescript
 * import { $, Seidr } from '@fimbul-works/seidr';
 *
 * const isActive = new Seidr(false);
 * const count = new Seidr(0);
 *
 * const button = $('button', {
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
 * import { $, Seidr } from '@fimbul-works/seidr';
 *
 * const container = $('div', { className: 'container' }, [
 *   $('h1', { textContent: 'Title' }),
 *   $('p', { textContent: 'Description' }),
 *   () => $('button', { textContent: 'Dynamic' }) // Function child
 * ]);
 * ```
 *
 * @example
 * Complex reactive bindings
 * ```typescript
 * import { $, Seidr } from '@fimbul-works/seidr';
 *
 * const theme = new Seidr<'light' | 'dark'>('light');
 * const isLoading = new Seidr(false);
 *
 * const card = $('div', {
 *   className: theme.as(t => `card theme-${t}`),
 *   style: isLoading.as(loading => `opacity: ${loading ? 0.5 : 1}`),
 *   'aria-busy': isLoading // Reactive boolean attribute
 * });
 * ```
 */
export function $<K extends keyof HTMLElementTagNameMap, P extends keyof HTMLElementTagNameMap[K]>(
  tagName: K,
  props?: Partial<ReactiveProps<K, HTMLElementTagNameMap[K]> | ReactiveARIAMixin>,
  children?: (SeidrNode | (() => SeidrNode))[],
): SeidrElement<K> {
  // Helper function to check props for a Seidr instance
  const hasSeidrBindings = () => {
    // No props passed
    if (!props) {
      return false;
    }

    // Iterate
    for (const [prop, value] of Object.entries(props)) {
      if (isSeidr(value)) {
        return true;
      }

      // Check for SeidrElement properties
      if (["on", "clean", "remove"].includes(prop)) {
        throw new Error(`Unallowed property "${prop}"`);
      }
    }

    return false;
  };

  // Server-side rendering check: window === undefined || process.env.SEIDR_TEST_SSR === true
  const isServerSide = typeof window === "undefined" || (typeof process !== "undefined" && process.env.SEIDR_TEST_SSR);

  // Reuse the string
  const SEIDR_ID = "seidr-id";
  const SEIDR_ID_CAME_CASE = "seidrId"; // HTMLElement expects camelCase
  const DATA_SEIDR_ID = `data-${SEIDR_ID}`;

  // RenderContext for data-seidr-id
  const ctx = getRenderContext();

  // Handle SSR element
  if (isServerSide) {
    const el = new ServerHTMLElement(tagName, {}, []);
    let cleanups: (() => void)[] = [];

    // Properties that should be set directly on the element
    const directProps = new Set<string>([
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

    // If element has Seidr bindings, assign ID
    let elementId: string | undefined;
    if (hasSeidrBindings()) {
      elementId = String(ctx!.idCounter++);
      el.dataset[SEIDR_ID] = elementId;
    }

    // Process props and register bindings
    if (props) {
      for (const [prop, value] of Object.entries(props)) {
        if (prop === DATA_SEIDR_ID) {
          // Skip the data-seidr-id prop itself
          continue;
        }

        // Set up reactive binding
        if (isSeidr(value)) {
          // Register bindings - Seidr -> element.prop
          const scope = getActiveSSRScope();
          if (scope && elementId) {
            scope.registerBindings(value.id, elementId, prop);
          }

          cleanups.push(
            value.bind(el, (value, element) =>
              directProps.has(prop) ? ((element as any)[prop] = value) : element.setAttribute(prop, String(value)),
            ),
          );
        } else {
          if (directProps.has(prop)) {
            (el as any)[prop] = value;
          } else {
            el.setAttribute(prop, value);
          }
        }
      }
    }

    // Process children
    if (Array.isArray(children)) {
      children.forEach((child) => el.appendChild(isFn(child) ? (child as any)() : child));
    }

    // Store cleanup method
    const originalRemove = el.remove.bind(el);
    el.remove = () => {
      cleanups.forEach((cleanup) => cleanup());
      cleanups = [];
      originalRemove();
    };

    // @ts-expect-error
    return el;
  }

  // Client-side handling

  // If element has Seidr bindings and we have a render context, assign ID
  let elementId: string | undefined;
  if (
    typeof process !== "undefined" &&
    !process.env.CORE_BUNDLE &&
    hasSeidrBindings() &&
    ctx &&
    !isUndef(ctx.renderContextID)
  ) {
    elementId = String(ctx.idCounter++);

    // Try to find existing DOM element with this SeidrID
    const ssrEl = $query(`[${DATA_SEIDR_ID}="${elementId}"]`);
    if (ssrEl) {
      // Mark SSR element for removal (will be cleaned up at end of hydration)
      ssrEl.dataset.seidrRemove = "1";
    }
  }

  // Create a new HTMLElement if not found
  const el: HTMLElementTagNameMap[K] = document.createElement(tagName);
  let cleanups: (() => void)[] = [];
  if (typeof process !== "undefined" && !process.env.CORE_BUNDLE && typeof elementId !== "undefined") {
    el.dataset[SEIDR_ID_CAME_CASE] = elementId;
  }

  // Store original HTMLElement.remove function
  const domRemove = el.remove.bind(el);

  // Assign properties
  if (props) {
    for (const [prop, value] of Object.entries(props)) {
      // Set up reactive binding
      if (isSeidr(value)) {
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
    ): () => void {
      el.addEventListener(event, handler as EventListener, options);
      return () => el.removeEventListener(event, handler as EventListener, options);
    },
    clear(): void {
      Array.from(el.children).forEach((child: any) => child.remove());
    },
    remove(): void {
      this.clear();
      cleanups.forEach((cleanup) => cleanup());
      cleanups = [];
      domRemove();
    },
  } as SeidrElementInterface);

  // Append children
  if (Array.isArray(children)) {
    children.forEach((child) => {
      const item = isFn(child) ? child() : child;
      el.appendChild(isStr(item) ? $text(item) : item);
    });
  }

  // Check for hydration bindings (element has data-seidr-id from server)
  if (typeof process !== "undefined" && !process.env.CORE_BUNDLE && typeof elementId !== "undefined") {
    applyElementBindings(elementId);
  }

  return el as SeidrElement<K>;
}

/**
 * Creates a new DOM Text node.
 * @param text - String to convert into Dom Text node
 * @returns DOM Text node
 */
export const $text = (text: string) => document.createTextNode(text);
