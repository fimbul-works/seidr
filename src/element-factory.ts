import { createElement, type ReactiveProps, type SeidrElement, type SeidrNode } from "./element.js";

/**
 * Higher-order function that creates specialized element creator functions.
 *
 * Returns a function that creates HTML elements of the specified tag type with full TypeScript
 * type inference and IntelliSense support. Use this to create shorthand functions like
 * `div()`, `input()`, `span()`, etc.
 *
 * @template K - The HTML tag name (e.g., 'div', 'input', 'span')
 * @param {K} tagName - The HTML tag name for the specialized creator function
 * @returns {Function} A function that creates elements of the specified tag type
 *
 * @example
 * // Create specialized element creators
 * const div = elementFactory('div');
 * const input = elementFactory('input');
 * const button = elementFactory('button');
 *
 * @example
 * // Use the specialized creators
 * const container = div({ className: 'container' }, [
 *   input({ type: 'text', placeholder: 'Name' }),
 *   button({ textContent: 'Submit', onclick: () => console.log('clicked') })
 * ]);
 */
export const elementFactory = <K extends keyof HTMLElementTagNameMap>(
  tagName: K,
): ((
  options?: Partial<ReactiveProps<K, HTMLElementTagNameMap[K]>>,
  children?: SeidrNode[],
) => HTMLElementTagNameMap[K] & SeidrElement) => {
  return (
    options?: Partial<ReactiveProps<K, HTMLElementTagNameMap[K]>>,
    children?: SeidrNode[],
  ): HTMLElementTagNameMap[K] & SeidrElement => createElement(tagName, options, children);
};
