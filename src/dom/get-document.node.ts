import { getRenderContext } from "../render-context";
import { createServerComment, createServerDocument, createServerElement, createServerTextNode } from "../ssr/dom";
import { setInternalGetDocument } from "./get-document";

/**
 * Get the server Document implementation.
 * @returns {Document} Server Document implementation.
 */
export const getDocument = (): Document => {
  const ctx = getRenderContext();
  if (ctx.document) {
    return ctx.document;
  }

  const doc = createServerDocument();

  Object.defineProperties(doc, {
    createElement: {
      value: <K extends keyof HTMLElementTagNameMap>(tag: K): HTMLElementTagNameMap[K] => {
        return createServerElement<K>(tag, doc) as unknown as HTMLElementTagNameMap[K];
      },
    },
    createTextNode: {
      value: (data: string): Text => {
        return createServerTextNode(data, doc) as unknown as Text;
      },
    },
    createComment: {
      value: (data: string): Comment => {
        return createServerComment(data, doc) as unknown as Comment;
      },
    },
  });

  ctx.document = doc as unknown as Document;
  return ctx.document;
};

setInternalGetDocument(getDocument);
