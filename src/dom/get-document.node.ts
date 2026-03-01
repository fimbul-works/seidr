import { getRenderContext } from "../render-context";
import { createRenderFeature, getFeature, setFeature } from "../render-context/feature";
import { SSRDocument } from "../ssr/dom";
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

  const doc = new SSRDocument();

  setFeature(documentFeature, doc as unknown as Document, ctx);
  return getFeature(documentFeature, ctx)!;
};

setInternalGetDocument(getDocument);
