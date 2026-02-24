import { getRenderContext } from "../render-context";
import { createRenderFeature, getFeature, setFeature } from "../render-context/feature";
import { createServerComment, createServerDocument, createServerElement, createServerTextNode } from "../ssr/dom";
import { setInternalGetDocument } from "./get-document";

export const documentFeature = createRenderFeature<Document | undefined>({
  id: "seidr.ssr.document",
});

/**
 * Get the server Document implementation.
 * @returns {Document} Server Document implementation.
 */
export const getDocument = (): Document => {
  const ctx = getRenderContext();
  const currentDoc = getFeature(documentFeature, ctx);
  if (currentDoc) {
    return currentDoc;
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

  setFeature(documentFeature, doc as unknown as Document, ctx);
  return getFeature(documentFeature, ctx)!;
};

setInternalGetDocument(getDocument);
