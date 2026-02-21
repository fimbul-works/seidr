import { getDocument } from "../get-document";

/**
 * Call Document.getElementId to find an element.
 *
 * This utility provides a type-safe way to query the DOM with CSS selectors.
 * It's more concise than document.querySelector() and provides better TypeScript
 * support with generic typing.
 *
 * @template {HTMLElement} T - The expected HTMLElement type
 *
 * @param {string} id - The element ID
 * @returns {T | null} The element matching the ID, or null if not found
 */
export const $getById = <T extends HTMLElement>(id: string): T | null => getDocument().getElementById(id) as T;
