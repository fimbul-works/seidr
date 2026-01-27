import { $, type SeidrElement, type SeidrElementProps, type SeidrNode } from "./element";

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
 * @param {SeidrElementProps<K>} [initialProps] - Optional default props to apply to all created elements
 * @returns {((
 *   props?: SeidrElementProps<K>,
 *   children?: SeidrNode[],
 * ) => SeidrElement<K>)} A specialized function that creates elements of the specified type
 */
export const $factory =
  <K extends keyof HTMLElementTagNameMap>(tagName: K, initialProps?: SeidrElementProps<K>) =>
  (props?: SeidrElementProps<K>, children?: SeidrNode[]): SeidrElement<K> =>
    $(tagName, initialProps ? { ...initialProps, ...props } : props, children);
