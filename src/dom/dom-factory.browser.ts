import { setInternalDOMFactory } from "./dom-factory";
import type { DOMFactory } from "./types";

/**
 * Browser DOMFactory implementation.
 */
const domFactoryBrowser: DOMFactory = {
  createElement<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    options?: ElementCreationOptions,
  ): HTMLElementTagNameMap[K] {
    return document.createElement(tag, options);
  },
  createTextNode(data: string): Text {
    return document.createTextNode(data);
  },
  createComment(data: string): Comment {
    return document.createComment(data);
  },
  getDocument(): Document {
    return document;
  },
};

/**
 * Get the browser DOMFactory implementation.
 * @returns {DOMFactory} Browser DOMFactory implementation.
 */
export const getBrowserDOMFactory = (): DOMFactory => domFactoryBrowser;

setInternalDOMFactory(getBrowserDOMFactory);
