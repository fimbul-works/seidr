import { getAppState } from "../app-state/app-state";
import { SSRDocument } from "../ssr/dom";
import { SeidrError } from "../types";
import { isClient, isServer } from "../util/environment";

/**
 * Cross-environment getDocument.
 *
 * @returns {Document} Document object.
 */
export const getDocument: () => Document = (): Document => {
  if (isClient()) {
    return document;
  } else if (isServer()) {
    const appState = getAppState();

    const SSR_DOCUMENT_DATA_KEY = "seidr.ssr.document";
    if (appState.hasData(SSR_DOCUMENT_DATA_KEY)) {
      return appState.getData<Document>(SSR_DOCUMENT_DATA_KEY)!;
    }

    const doc = new SSRDocument() as unknown as Document;
    appState.setData(SSR_DOCUMENT_DATA_KEY, doc);
    return doc;
  } else {
    throw new SeidrError("getDocument not initialized");
  }
};
