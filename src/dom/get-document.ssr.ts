import { getAppState } from "../app-state/app-state.js";
import { DATA_KEY_DOCUMENT } from "../constants.js";
import { SSRDocument } from "../ssr/dom/ssr-document.js";
import { setDocumentProvider } from "./get-document.js";

/**
 * Returns the SSR Document object.
 * @returns {Document} SSR Document object.
 */
export const getSSRDocument = (): Document => {
  const appState = getAppState();

  if (appState.hasData(DATA_KEY_DOCUMENT)) {
    return appState.getData<Document>(DATA_KEY_DOCUMENT)!;
  }

  const doc = new SSRDocument() as unknown as Document;
  appState.setData(DATA_KEY_DOCUMENT, doc);
  return doc;
};

/**
 * Initializes the SSR Document provider.
 * @internal
 */
export const initSSRDocument = () => {
  setDocumentProvider(getSSRDocument);
};
