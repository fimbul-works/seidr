import { getDOMFactory } from "../dom-factory";
import { getRenderContext } from "../render-context";
import type { CleanupFunction } from "../types";
import { isSeidr } from "../util/type-guards";
import { appendChildNode, assignProp } from "./dom-utils";
import type { SeidrElement, SeidrElementInterface, SeidrElementProps, SeidrNode } from "./types";
import { SEIDR_CLEANUP } from "./types";

/**
 * Creates an HTML element with automatic reactive binding capabilities.
 *
 * @template {keyof HTMLElementTagNameMap} K - The HTML tag name from HTMLElementTagNameMap
 *
 * @param {K} tagName - The HTML tag name to create
 * @param {SeidrElementProps<K>} [props] - Element properties supporting reactive bindings
 * @param {(SeidrNode | (() => SeidrNode))[]} [children] - Child elements or functions returning elements
 * @returns {SeidrElement<K>} A Seidr-enhanced HTML element with additional methods
 */
export function $<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  props?: SeidrElementProps<K>,
  children?: (SeidrNode | (() => SeidrNode))[],
): SeidrElement<K> {
  const domFactory = getDOMFactory();
  const ctx = getRenderContext();
  const el = domFactory.createElement(tagName);
  let cleanups: CleanupFunction[] = [];

  // Reuse the string for hydration
  const SEIDR_ID_CAMEL_CASE = "seidrId";

  // Assign hydration ID if needed (any reactive property triggers this)
  const hasBindings = props ? Object.values(props).some(isSeidr) : false;
  if (hasBindings && ctx) {
    el.dataset[SEIDR_ID_CAMEL_CASE] = String(ctx.idCounter++);
  }

  // Assign properties
  if (props) {
    const reserved = ["on", "clear", "isSeidrElement"];
    for (const [prop, value] of Object.entries(props)) {
      if (reserved.includes(prop)) {
        throw new Error(`Unallowed property "${prop}"`);
      }
      assignProp(el, prop, value, cleanups);
    }
  }

  // Add extra Seidr features
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
      while (el.firstChild) {
        const child = el.firstChild;
        if ((child as any).remove) (child as any).remove();
        else el.removeChild(child);
      }
    },
    [SEIDR_CLEANUP](): void {
      for (const cleanup of cleanups) cleanup();
      cleanups = [];
      for (const child of Array.from(el.childNodes)) {
        if ((child as any)[SEIDR_CLEANUP]) (child as any)[SEIDR_CLEANUP]();
      }
    },
    remove(): void {
      (this as any)[SEIDR_CLEANUP]();
      // Use original proto to avoid recursion
      const proto = (el as any).constructor.prototype;
      if (proto.remove) {
        proto.remove.call(el);
      } else if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    },
  } as SeidrElementInterface);

  // Append children
  if (Array.isArray(children)) {
    children.forEach((child) => {
      appendChildNode(el, child, cleanups, $text);
    });
  }

  return el as unknown as SeidrElement<K>;
}

/**
 * Creates a new DOM Text node.
 * @param {unknown} text - String to convert into Dom Text node
 * @returns {Text} DOM Text node
 */
export const $text = (text: unknown): Text => {
  const domFactory = getDOMFactory();
  return domFactory.createTextNode(String(text));
};

/**
 * Creates a new DOM Comment node.
 * @param {string} text - String to convert into Dom Comment node
 * @returns {Comment} DOM Comment node
 */
export const $comment = (text: string): Comment => {
  const domFactory = getDOMFactory();
  return domFactory.createComment(text);
};
