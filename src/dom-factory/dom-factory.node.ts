import {
  createServerCommentNode,
  createServerDocumentFragment,
  createServerHTMLElement,
  createServerTextNode,
} from "../ssr/dom";
import { setInternalDOMFactory } from "./dom-factory";
import type { DOMFactory } from "./types";

/**
 * Node DOMFactory implementation.
 */
export const domFactory = {
  createElement<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    options?: ElementCreationOptions,
  ): HTMLElementTagNameMap[K] {
    return createServerHTMLElement(tag, options) as unknown as HTMLElementTagNameMap[K];
  },
  createDocumentFragment(): DocumentFragment {
    return createServerDocumentFragment() as unknown as DocumentFragment;
  },
  createTextNode(data: string): Text {
    return createServerTextNode(data) as unknown as Text;
  },
  createComment(data: string): Comment {
    return createServerCommentNode(data) as unknown as Comment;
  },
} as DOMFactory;

/**
 * Get the node DOMFactory implementation.
 * @returns {DOMFactory} Node DOMFactory implementation.
 */
export const getDOMFactory = (): DOMFactory => domFactory;

setInternalDOMFactory(getDOMFactory);
