import { getRenderContext } from "../render-context";
import {
  createServerComment,
  createServerDocument,
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
    const el = createServerElement(tag);
    (el as any)._ownerDocument = this.getDocument();
    return el as unknown as HTMLElementTagNameMap[K];
  },
  createDocumentFragment(): DocumentFragment {
    const frag = createServerDocumentFragment();
    (frag as any)._ownerDocument = this.getDocument();
    return frag as unknown as DocumentFragment;
  },
  createTextNode(data: string): Text {
    const node = createServerTextNode(data);
    (node as any)._ownerDocument = this.getDocument();
    return node as unknown as Text;
  },
  createComment(data: string): Comment {
    const node = createServerComment(data);
    (node as any)._ownerDocument = this.getDocument();
    return node as unknown as Comment;
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
