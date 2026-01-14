import { $, type ReactiveARIAMixin, type ReactiveProps, type SeidrElement, type SeidrNode } from "./element";

/**
 * Creates a specialized HTML element creator function for a specific tag type.
 *
 * This higher-order function generates type-safe element creators that provide
 * full TypeScript IntelliSense support and automatic type inference. Each created
 * function is optimized for creating elements of a specific HTML tag type.
 *
 * The resulting function supports reactive props, children elements, and maintains
 * the same API as $ but with tag-specific type safety.
 *
 * @template {keyof HTMLElementTagNameMap} K - The HTML tag name from HTMLElementTagNameMap
 *
 * @param {K} tagName - The HTML tag name to create a specialized factory for
 * @param {Partial<ReactiveProps<K, HTMLElementTagNameMap[K]> & ReactiveARIAMixin>} [initialProps] - Optional default props to apply to all created elements
 * @returns {((
 *   options?: Partial<ReactiveProps<K, HTMLElementTagNameMap[K]> & ReactiveARIAMixin>,
 *   children?: SeidrNode[],
 * ) => HTMLElementTagNameMap[K] & SeidrElement)} A specialized function that creates elements of the specified type
 */
export function $factory<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  initialProps?: Partial<ReactiveProps<K, HTMLElementTagNameMap[K]> & ReactiveARIAMixin>,
): (
  options?: Partial<ReactiveProps<K, HTMLElementTagNameMap[K]> & ReactiveARIAMixin>,
  children?: SeidrNode[],
) => HTMLElementTagNameMap[K] & SeidrElement {
  return (
    options?: Partial<ReactiveProps<K, HTMLElementTagNameMap[K]> & ReactiveARIAMixin>,
    children?: SeidrNode[],
  ): HTMLElementTagNameMap[K] & SeidrElement =>
    $(tagName, initialProps ? { ...initialProps, ...options } : options, children);
}
