import type { ReactiveARIAKebabCase, ReactiveARIAMixin } from "src/element";
import { type CaseProxyResult, createCaseProxy } from "./case-proxy";

/**
 * Creates a proxy for ARIA attributes.
 * @param {ReactiveARIAKebabCase} storage The storage for the ARIA proxy.
 * @returns {CaseProxyResult<ReactiveARIAMixin, ReactiveARIAKebabCase>} A proxy for ARIA attributes.
 */
export function createAriaProxy(
  storage: ReactiveARIAKebabCase = {} as ReactiveARIAKebabCase,
): CaseProxyResult<ReactiveARIAMixin, ReactiveARIAKebabCase> {
  return createCaseProxy<ReactiveARIAMixin, ReactiveARIAKebabCase>({
    prefix: "aria-",
    dropPrefix: false,
    storage,
  });
}
