import { $ } from "./element.js";
import type { Attributes, ServerHTMLElement } from "./server-element.js";

/**
 * Higher-order function that creates specialized server element creator functions.
 *
 * @template K - The HTML tag name (e.g., 'div', 'input', 'span')
 * @param {K} tagName - The HTML tag name for the specialized creator function
 * @returns {Function} A function that creates elements of the specified tag type
 *
 * @example
 * // Create specialized element creators
 * const div = el('div');
 * const input = el('input');
 * const button = el('button');
 *
 * @example
 * // Use the specialized creators
 * const container = div({ className: 'container' }, [
 *   input({ type: 'text', placeholder: 'Name' }),
 *   button({ textContent: 'Submit', onclick: () => console.log('clicked') })
 * ]);
 */
export const $factory = <K extends string>(tagName: K) => {
  return (props?: Attributes, children?: (ServerHTMLElement | string)[]): ServerHTMLElement =>
    $(tagName, props, children);
};
