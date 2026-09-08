import { $ } from "./create-element.js";
import { isNullish } from "../util/type-guards.js";
import { isValidSeidrChild } from "./type-guards.js";
import type { SeidrChild, SeidrElementProps } from "./types.js";

/**
 * Specialized HTML element creator function interface.
 */
export interface SeidrElementFactory<K extends keyof HTMLElementTagNameMap> {
  (children?: SeidrChild | SeidrChild[]): HTMLElementTagNameMap[K];
  (props?: SeidrElementProps<K> | null, children?: SeidrChild | SeidrChild[]): HTMLElementTagNameMap[K];
}

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
 * @param {SeidrElementProps<K>} [defaultProps={}] - Optional default props to apply to all created elements
 * @returns {SeidrElementFactory<K>} A specialized function that creates elements of the specified type
 */
export const $factory =
  <K extends keyof HTMLElementTagNameMap>(
    tagName: K,
    defaultProps: SeidrElementProps<K> = {},
  ): SeidrElementFactory<K> =>
  (
    propsOrChildren?: SeidrElementProps<K> | SeidrChild | SeidrChild[] | null,
    children?: SeidrChild | SeidrChild[],
  ): HTMLElementTagNameMap[K] =>
    !isNullish(children) || !isValidSeidrChild(propsOrChildren)
      ? $(tagName, { ...defaultProps, ...((propsOrChildren as SeidrElementProps<K>) ?? {}) }, children)
      : $(tagName, defaultProps, propsOrChildren);
