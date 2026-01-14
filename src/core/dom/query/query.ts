/**
 * Call HTMLElement.querySelector to find the first matching element.
 *
 * This utility provides a type-safe way to query the DOM with CSS selectors.
 * It's more concise than document.querySelector() and provides better TypeScript
 * support with generic typing.
 *
 * @template {HTMLElement} T - The expected HTMLElement type
 *
 * @param {string} query - The CSS selector string to query for
 * @param {HTMLElement} [el] - The element to query within (defaults: document.body)
 * @returns {T | null} The first element matching the selector, or null if not found
 */
export const $query = <T extends HTMLElement>(query: string, el: HTMLElement = document.body): T | null =>
  el.querySelector(query) as T;
