import { SeidrError } from "../types.js";
import { isClient } from "../util/environment/is-client.js";

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
 * @returns {Document} Document object
 * @throws {SeidrError} if getDocument is not initialized
 */
export function defaultClientDocument(): Document {
  if (isClient()) {
    return window.document;
  }

  throw new SeidrError("getDocument not initialized");
}

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
