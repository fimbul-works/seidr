import { getAppState } from "../app-state/app-state";
import { SeidrError } from "../types";
import { isClient } from "../util/environment/client";

/** Key used to store the document provider in AppState data */
export const DOCUMENT_PROVIDER_KEY = "seidr.internal.document_provider";

/**
 * Cross-environment getDocument.
 *
 * @returns {Document} Document object.
 */
export let getDocument: () => Document = (): Document => {
  const state = getAppState();
  const provider = state?.getData<() => Document>(DOCUMENT_PROVIDER_KEY);
  if (provider) {
    return provider();
  }

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
export const setInternalGetDocument: (fn: () => Document) => void = (fn: () => Document): void => {
  const state = getAppState();
  if (state) {
    state.setData(DOCUMENT_PROVIDER_KEY, fn);
  }
  getDocument = fn;
};
