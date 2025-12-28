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
 *
 * @example
 * Basic usage
 * ```typescript
 * import { $queryAll } from '@fimbul-works/seidr';
 *
 * const buttons = $queryAll('button'); // Returns HTMLButtonElement[]
 * const items = $queryAll('.list-item'); // Returns HTMLElement[]
 * const inputs = $queryAll('input[type="text"]'); // Returns HTMLInputElement[]
 * ```
 *
 * @example
 * With custom container
 * ```typescript
 * import { $queryAll } from '@fimbul-works/seidr';
 *
 * const form = $('form.user-form');
 * const formInputs = $queryAll('input', form);
 * ```
 *
 * @example
 * Array manipulation
 * ```typescript
 * import { $queryAll } from '@fimbul-works/seidr';
 *
 * const checkboxes = $queryAll('input[type="checkbox"]');
 * const checkedCount = checkboxes.filter(cb => cb.checked).length;
 * checkboxes.forEach(cb => cb.addEventListener('change', handleChange));
 * ```
 */
export const $queryAll = <T extends HTMLElement>(query: string, el: HTMLElement = document.body): T[] =>
  Array.from(el.querySelectorAll(query)) as T[];
