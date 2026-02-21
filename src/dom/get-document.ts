import { SeidrError } from "../types";
import { isClient } from "../util/environment/client";

/**
 * Cross-environment getDocument.
 *
 * @returns {Document} Document object.
 */
export let getDocument: () => Document = (): Document => {
  if (isClient()) {
    return document;
  }
  throw new SeidrError("getDocument not initialized");
};

/**
 * Cross-environment getDocument contract dependency injector.
 *
 * @param {(() => Document)} fn
 */
export const setInternalGetDocument = (fn: () => Document): void => {
  getDocument = fn;
};
