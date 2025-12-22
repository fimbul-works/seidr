import { type CleanupFunction, Seidr } from "./seidr.js";

/** Accepted types for an Seidr attribute */
type Scalar = string | number | boolean;

/** Check if a type T exends X or Y, which maps it to A and B */
type IfEquals<X, Y, A = X, B = never> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? A : B;

/** Find all the non-readonly keys */
type WritableKeys<T> = {
  [K in keyof T]-?: IfEquals<{ [Q in K]: T[K] }, { -readonly [Q in K]: T[K] }, K>;
}[keyof T];

/** Scalar or an observable scalar? */
export type ReactiveValue<T> = [T] extends [Scalar] ? T | Seidr<T> : T;

/** We have a tag, and thus our HTML element - turn all writable scalar keys into ReactiveValue */
export type ReactiveProps<K extends keyof HTMLElementTagNameMap, T extends HTMLElementTagNameMap[K]> = {
  [K in WritableKeys<T>]?: ReactiveValue<T[K]>;
};

/** Allowed child nodes for SeidrElement */
export type SeidrNode = SeidrElement | HTMLElement | Text;

/**
 * Additional HTML element extra functionality
 */
export interface SeidrElement extends HTMLElement {
  /** Read-only truthiness value */
  readonly isSeidrElement: true;

  /**
   * Adds an event listener to an element and returns a cleanup function.
   *
   * @param el - The target element
   * @param event - The event type
   * @param handler - The event handler function
   * @param options - Optional event listener options
   * @returns A function that removes the event listener when called
   */
  on<E extends keyof HTMLElementEventMap>(
    event: E,
    handler: (ev: HTMLElementEventMap[E]) => any,
    options?: boolean | AddEventListenerOptions,
  ): CleanupFunction;

  /**
   * Remove the element and call all cleanup functions.
   */
  destroy(): void;

  /**
   * Toggles a CSS class on an element based on a boolean observable.
   *
   * When the observable is true, the class is added to the element.
   * When false, the class is removed. The binding is reactive and updates
   * automatically when the observable changes.
   *
   * @template E - The type of HTML element being bound to
   *
   * @param className - The CSS class name to toggle
   * @param observable - Boolean Seidr that controls the class
   *
   * @returns A cleanup function that removes the binding when called
   */
  toggleClass(className: string, observable: Seidr<boolean>): CleanupFunction;
}

/**
 * Creates an HTML element with the specified tag name, properties, and children.
 *
 * This is the core element creation function that handles property assignment and child appending.
 * If `options` is an array and `children` is undefined, `options` will be treated as children.
 *
 * @template K - The HTML tag name (e.g., 'div', 'input', 'span')
 * @param tagName - The HTML tag name to create
 * @param props - Element properties to assign
 * @param children - Child elements to append
 * @returns The created and configured HTML element
 */
export const createElement = <K extends keyof HTMLElementTagNameMap, P extends keyof HTMLElementTagNameMap[K]>(
  tagName: K,
  props?: Partial<ReactiveProps<K, HTMLElementTagNameMap[K]>>,
  children?: (SeidrNode | (() => SeidrNode))[],
): HTMLElementTagNameMap[K] & SeidrElement => {
  const el = document.createElement(tagName);
  const cleanups: (() => void)[] = [];

  // Assign properties
  if (props) {
    for (const [prop, value] of Object.entries(props)) {
      if (["on", "destroy"].includes(prop)) {
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

  return el as HTMLElementTagNameMap[K] & SeidrElement;
};
