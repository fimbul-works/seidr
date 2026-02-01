import {
  createServerComment,
  createServerDocumentFragment,
  createServerElement,
  createServerTextNode,
} from "../ssr/dom";
import { setInternalDOMFactory } from "./dom-factory";
import type { DOMFactory } from "./types";

/**
 * Node DOMFactory implementation.
 */
const domFactorySSR = {
  createElement<K extends keyof HTMLElementTagNameMap>(tag: K): HTMLElementTagNameMap[K] {
    return createServerElement(tag) as unknown as HTMLElementTagNameMap[K];
  },
  createDocumentFragment(): DocumentFragment {
    return createServerDocumentFragment() as unknown as DocumentFragment;
  },
  createTextNode(data: string): Text {
    return createServerTextNode(data) as unknown as Text;
  },
  createComment(data: string): Comment {
    return createServerComment(data) as unknown as Comment;
  },
} as DOMFactory;

/**
 * Get the node DOMFactory implementation.
 * @returns {DOMFactory} Node DOMFactory implementation.
 */
export const getSSRDOMFactory = (): DOMFactory => domFactorySSR;

setInternalDOMFactory(getSSRDOMFactory);
