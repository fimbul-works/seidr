import { SEIDR_CLEANUP, TYPE_ELEMENT, TYPE_PROP } from "../constants";
import type { CleanupFunction } from "../types";
import type { SeidrElement, SeidrElementInterface } from "./types";

/**
 * Decorates an HTMLElement with Seidr functionality.
 *
 * @template {keyof HTMLElementTagNameMap} K - The HTML tag name from HTMLElementTagNameMap
 * @param {HTMLElement} el - The HTMLElement to decorate
 * @param {CleanupFunction[]} cleanups - Array to push cleanup functions to
 * @returns {SeidrElement<K>} The decorated HTMLElement
 */
export const decorateElement = <K extends keyof HTMLElementTagNameMap>(
  el: HTMLElement,
  cleanups: CleanupFunction[] = [],
): SeidrElement<K> => {
  const originalRemove = el.remove.bind(el);

  Object.defineProperties(el, {
    [TYPE_PROP]: {
      get: () => TYPE_ELEMENT,
      enumerable: false,
      configurable: true,
    },
    on: {
      value<E extends keyof HTMLElementEventMap>(
        event: E,
        handler: (ev: HTMLElementEventMap[E]) => any,
        options?: boolean | AddEventListenerOptions,
      ): CleanupFunction {
        el.addEventListener(event, handler as EventListener, options);
        const removeEventListener = () => el.removeEventListener(event, handler as EventListener, options);
        cleanups.push(removeEventListener);
        return removeEventListener;
      },
      enumerable: false,
      configurable: true,
      writable: true,
    },
    clearChildren: {
      value(): void {
        while (el.firstChild) {
          const child = el.firstChild as ChildNode;
          if (child.remove) {
            child.remove();
          } else {
            el.removeChild(child);
          }
        }
      },
      enumerable: false,
      configurable: true,
      writable: true,
    },
    [SEIDR_CLEANUP]: {
      value(): void {
        cleanups.forEach((cleanup) => cleanup());
        cleanups.length = 0;
        for (const child of Array.from(el.childNodes)) {
          (child as SeidrElement<K> & SeidrElementInterface)[SEIDR_CLEANUP]?.();
        }
      },
      enumerable: false,
      configurable: true,
    },
    remove: {
      value(): void {
        (el as SeidrElement<K> & SeidrElementInterface)[SEIDR_CLEANUP]?.();
        originalRemove();
      },
      enumerable: false,
      configurable: true,
    },
  });

  return el as SeidrElement<K>;
};
