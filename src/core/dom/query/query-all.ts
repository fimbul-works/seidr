/**
 * Call HTMLElement.querySelectorAll to find all matching elements.
 *
 * This utility provides a type-safe way to query multiple DOM elements
 * with CSS selectors. Returns an array instead of a NodeList for easier
 * manipulation and better TypeScript support.
 *
 * @template {HTMLElement} T - The expected HTMLElement type
 *
 * @param {string} query - The CSS selector string to query for
 * @param {HTMLElement} [el] - The element to query within (defaults: document.body)
 * @returns {T[]} An array of all elements matching the selector
 */
export const $queryAll = <T extends HTMLElement>(query: string, el: HTMLElement = document.body): T[] =>
  Array.from(el.querySelectorAll(query)) as T[];
