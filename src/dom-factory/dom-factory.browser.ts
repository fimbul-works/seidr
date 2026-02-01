import { setInternalDOMFactory } from "./dom-factory";
import type { DOMFactory } from "./types";

/**
 * Browser DOMFactory implementation.
 */
const domFactoryBrowser = {
  createElement<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    options?: ElementCreationOptions,
  ): HTMLElementTagNameMap[K] {
    return document.createElement(tag, options);
  },
  createDocumentFragment(): DocumentFragment {
    return document.createDocumentFragment();
  },
  createTextNode(data: string): Text {
    return document.createTextNode(data);
  },
  createComment(data: string): Comment {
    return document.createComment(data);
  },
} as DOMFactory;

/**
 * Get the browser DOMFactory implementation.
 * @returns {DOMFactory} Browser DOMFactory implementation.
 */
export const getBrowserDOMFactory = (): DOMFactory => domFactoryBrowser;

setInternalDOMFactory(getBrowserDOMFactory);
