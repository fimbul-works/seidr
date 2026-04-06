import { SeidrError } from "../types";

/**
 * Global type declaration for the document provider.
 */
declare global {
  var __SEIDR_DOCUMENT_PROVIDER__: (() => Document) | undefined;
}

/** Key that is shared across build targets */
const DOC_KEY = "__SEIDR_DOCUMENT_PROVIDER__";

/**
 * Default client-side getDocument implementation.
 *
 * @returns {Document} Document object.
 */
export const defaultClientDocument: () => Document = (): Document => {
  if (typeof window !== "undefined") {
    return window.document;
  }

  throw new SeidrError("getDocument not initialized");
};

/** AppState provider is shared across built bundles */
if (!globalThis[DOC_KEY]) {
  globalThis[DOC_KEY] = defaultClientDocument;
}

/**
 * Get the current document.
 *
 * @returns {Document} Document object.
 */
export const getDocument = (): Document => globalThis[DOC_KEY]!();

/**
 * Cross-environment getDocument contract dependency injector.
 *
 * @param {(() => Document)} fn
 * @internal
 */
export const setDocumentProvider = (fn: () => Document) => {
  globalThis[DOC_KEY] = fn;
};
