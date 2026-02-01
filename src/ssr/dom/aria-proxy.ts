import type { ReactiveARIAKebabCase, ReactiveARIAMixin } from "src/element";
import { createCaseProxy } from "./case-proxy";

/**
 * The storage for the ARIA proxy.
 */
export type ARIAProxyStorage = ReactiveARIAKebabCase & ReactiveARIAMixin;

/**
 * Creates a proxy for ARIA attributes.
 * @param {ARIAProxyStorage} storage The storage for the ARIA proxy.
 * @returns {ARIAProxyStorage} A proxy for ARIA attributes.
 */
export function createAriaProxy(storage: ARIAProxyStorage = {} as ARIAProxyStorage) {
  return createCaseProxy<ARIAProxyStorage>({
    prefix: "aria-",
    dropPrefix: false,
    storage,
  });
}
