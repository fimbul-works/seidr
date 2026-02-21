import { setInternalGetDocument } from "./get-document";

/**
 * Get the browser Document implementation.
 * @returns {Document} Browser Document implementation.
 */
export const getDocument = (): Document => document;

setInternalGetDocument(getDocument);
