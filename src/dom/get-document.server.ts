import { getAppState } from "../app-state/app-state";
import { SSRDocument } from "../ssr/dom";
import { setInternalGetDocument } from "./get-document";

export const DOCUMENT_DATA_KEY = "seidr.ssr.document";

/**
 * Get the server Document implementation.
 * @returns {Document} Server Document implementation.
 */
export const getDocument = (): Document => {
  const state = getAppState();
  const currentDoc = state.getData<Document>(DOCUMENT_DATA_KEY);
  if (currentDoc) {
    return currentDoc;
  }

  const doc = new SSRDocument() as unknown as Document;

  state.setData(DOCUMENT_DATA_KEY, doc);
  return doc;
};

setInternalGetDocument(getDocument);
