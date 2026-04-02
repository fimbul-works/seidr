import { getAppState } from "../app-state/app-state";
import { DATA_KEY_SSR_DOCUMENT } from "../constants";
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

    if (appState.hasData(DATA_KEY_SSR_DOCUMENT)) {
      return appState.getData<Document>(DATA_KEY_SSR_DOCUMENT)!;
    }

    const doc = new SSRDocument() as unknown as Document;
    appState.setData(DATA_KEY_SSR_DOCUMENT, doc);
    return doc;
  } else {
    throw new SeidrError("getDocument not initialized");
  }
};
