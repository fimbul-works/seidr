/**
 * Call HTMLElement.querySelector to find the first matching element.
 *
 * This utility provides a type-safe way to query the DOM with CSS selectors.
 * It's more concise than document.querySelector() and provides better TypeScript
 * support with generic typing.
 *
 * @template T extends HTMLElement - The expected HTMLElement type
 *
 * @param query - The CSS selector string to query for
 * @param el - The element to query within (defaults to document.body)
 *
 * @returns The first element matching the selector, or null if not found
 *
 * @example
 * Basic usage
 * ```typescript
 * import { $ } from '@fimbul-works/seidr';
 *
 * const button = $('button'); // Returns HTMLButtonElement | null
 * const container = $('.container'); // Returns HTMLElement | null
 * const input = $('input[type="text"]'); // Returns HTMLInputElement | null
 * ```
 *
 * @example
 * With custom container
 * ```typescript
 * import { $ } from '@fimbul-works/seidr';
 *
 * const form = $('form.user-form');
 * const submitButton = $('button[type="submit"]', form);
 * ```
 *
 * @example
 * Type-safe element access
 * ```typescript
 * import { $ } from '@fimbul-works/seidr';
 *
 * const canvas = $('canvas') as HTMLCanvasElement;
 * if (canvas) {
 *   const ctx = canvas.getContext('2d');
 *   // Work with canvas context
 * }
 * ```
 */
export const $getById = <T extends HTMLElement>(id: string): T | null => document.getElementById(id) as T;
