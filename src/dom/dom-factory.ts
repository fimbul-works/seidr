import { SeidrError } from "../types";
import type { DOMFactory } from "./types";

/**
 * Cross-environment getDOMFactory.
 *
 * @returns {DOMFactory} DOMFactory object.
 */
export let getDOMFactory: () => DOMFactory = (): DOMFactory => {
  throw new SeidrError("DOMFactory not initialized");
};

/**
 * Cross-environment getDOMFactory contract dependency injector.
 *
 * @param {(() => DOMFactory)} fn
 */
export function setInternalDOMFactory(fn: () => DOMFactory) {
  getDOMFactory = fn;
}
