import { getRenderContext } from "../render-context";
import { createServerComment, createServerDocument, createServerElement, createServerTextNode } from "../ssr/dom";
import { setInternalDOMFactory } from "./dom-factory";
import type { DOMFactory } from "./types";

/**
 * Node DOMFactory implementation.
 */
const domFactorySSR: DOMFactory = {
  createElement<K extends keyof HTMLElementTagNameMap>(tag: K): HTMLElementTagNameMap[K] {
    return createServerElement<K>(tag, this.getDocument() as any) as unknown as HTMLElementTagNameMap[K];
  },
  createTextNode(data: string): Text {
    return createServerTextNode(data, this.getDocument() as any) as unknown as Text;
  },
  createComment(data: string): Comment {
    return createServerComment(data, this.getDocument() as any) as unknown as Comment;
  },
  getDocument(): Document {
    const ctx = getRenderContext();
    if (ctx.document) {
      return ctx.document;
    }
    const doc = createServerDocument() as unknown as Document;
    if (ctx) {
      ctx.document = doc;
    }
    return doc;
  },
} as DOMFactory;

/**
 * Get the node DOMFactory implementation.
 * @returns {DOMFactory} Node DOMFactory implementation.
 */
export const getSSRDOMFactory = (): DOMFactory => domFactorySSR;

setInternalDOMFactory(getSSRDOMFactory);
