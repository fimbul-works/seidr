import { SeidrError } from "../types.js";
import { isClient } from "../util/environment/is-client.js";

/**
 * Default client-side getDocument implementation.
 *
 * @returns {Document} Document object
 * @throws {SeidrError} if getDocument is not initialized
 */
export function defaultClientDocument(): Document {
  if (isClient()) {
    return document;
  }

  throw new SeidrError("getDocument not initialized");
}

/**
 * Get the current document.
 *
 * @returns {Document} Document object.
 */
export let getDocument = defaultClientDocument;

/**
 * Cross-environment getDocument contract dependency injector.
 *
 * @param {(() => Document)} fn
 * @internal
 */
export const setDocumentProvider = (fn: () => Document) => {
  getDocument = fn;
};
