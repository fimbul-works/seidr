import { getDOMFactory } from "../dom-factory";
import { getRenderContext } from "../render-context";
import { type CleanupFunction, SEIDR_CLEANUP, TYPE, TYPE_PROP } from "../types";
import { isArr, isDOMNode, isSeidr, isStr } from "../util/type-guards";
import { assignProp } from "./assign-prop";
import type { SeidrElement, SeidrElementInterface, SeidrElementProps, SeidrNode } from "./types";

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
  children?: SeidrNode[],
): SeidrElement<K> {
  const domFactory = getDOMFactory();
  const ctx = getRenderContext();
  const el = domFactory.createElement(tagName);
  const originalRemove = el.remove.bind(el);
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
    const reserved = [TYPE_PROP, "on", "clear", SEIDR_CLEANUP];
    for (const [prop, value] of Object.entries(props)) {
      if (reserved.includes(prop)) {
        throw new Error(`Unallowed property "${prop}"`);
      }
      assignProp(el, prop, value, cleanups);
    }
  }

  // Add extra Seidr features
  Object.assign(el, {
    get [TYPE_PROP]() {
      return TYPE.ELEMENT;
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
      for (const child of el.childNodes) {
        if ((child as any)[SEIDR_CLEANUP]) (child as any)[SEIDR_CLEANUP]();
      }
    },
    remove(): void {
      (this as any)[SEIDR_CLEANUP]();
      originalRemove();
    },
  } as SeidrElementInterface);

  // Append children
  if (isArr(children)) {
    children.forEach((child) => {
      if (!isDOMNode(child)) {
        el.appendChild($text(child));
      } else {
        el.appendChild(child);
      }
    });
  }

  return el as unknown as SeidrElement<K>;
}

/**
 * Creates a new DOM Text node.
 * @param {unknown} text - String to convert into Dom Text node
 * @returns {Text} DOM Text node
 */
export const $text = (text: unknown): Text => getDOMFactory().createTextNode(String(text));

/**
 * Creates a new DOM Comment node.
 * @param {string} text - String to convert into Dom Comment node
 * @returns {Comment} DOM Comment node
 */
export const $comment = (text: string): Comment => getDOMFactory().createComment(text);
