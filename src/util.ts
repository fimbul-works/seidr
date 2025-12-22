import { Seidr } from "./seidr.js";

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
export const $q = <T extends HTMLElement>(query: string, el: HTMLElement = document.body): T | null =>
  el.querySelector(query);

/**
 * Call HTMLElement.querySelectorAll to find all matching elements.
 *
 * This utility provides a type-safe way to query multiple DOM elements
 * with CSS selectors. Returns an array instead of a NodeList for easier
 * manipulation and better TypeScript support.
 *
 * @template T extends HTMLElement - The expected HTMLElement type
 *
 * @param query - The CSS selector string to query for
 * @param el - The element to query within (defaults to document.body)
 *
 * @returns An array of all elements matching the selector
 *
 * @example
 * Basic usage
 * ```typescript
 * import { $all } from '@fimbul-works/seidr';
 *
 * const buttons = $all('button'); // Returns HTMLButtonElement[]
 * const items = $all('.list-item'); // Returns HTMLElement[]
 * const inputs = $all('input[type="text"]'); // Returns HTMLInputElement[]
 * ```
 *
 * @example
 * With custom container
 * ```typescript
 * import { $all } from '@fimbul-works/seidr';
 *
 * const form = $('form.user-form');
 * const formInputs = $all('input', form);
 * ```
 *
 * @example
 * Array manipulation
 * ```typescript
 * import { $all } from '@fimbul-works/seidr';
 *
 * const checkboxes = $all('input[type="checkbox"]');
 * const checkedCount = checkboxes.filter(cb => cb.checked).length;
 * checkboxes.forEach(cb => cb.addEventListener('change', handleChange));
 * ```
 */
export const $all = <T extends HTMLElement>(query: string, el: HTMLElement = document.body): T[] =>
  Array.from(el.querySelectorAll(query));

/**
 * Creates a debounced version of a function that delays execution.
 *
 * Debouncing ensures that a function is only executed once after a specified
 * delay period, even if it's called multiple times during that period.
 * This is particularly useful for event handlers, API calls, and search
 * functionality to prevent excessive execution.
 *
 * @template Args extends unknown[] - The argument types for the callback function
 *
 * @param callback - The function to debounce
 * @param waitMs - The delay in milliseconds before executing the callback
 *
 * @returns A debounced version of the callback function
 *
 * @example
 * Basic debouncing for search input
 * ```typescript
 * import { debounce } from '@fimbul-works/seidr';
 *
 * const handleSearch = debounce((query: string) => {
 *   fetch(`/api/search?q=${query}`)
 *     .then(res => res.json())
 *     .then(results => displayResults(results));
 * }, 300);
 *
 * searchInput.addEventListener('input', (e) => {
 *   handleSearch((e.target as HTMLInputElement).value);
 * });
 * ```
 *
 * @example
 * Debouncing resize events
 * ```typescript
 * import { debounce } from '@fimbul-works/seidr';
 *
 * const handleResize = debounce(() => {
 *   console.log('Window resized:', window.innerWidth);
 *   updateLayout();
 * }, 250);
 *
 * window.addEventListener('resize', handleResize);
 * ```
 *
 * @example
 * API call debouncing
 * ```typescript
 * import { debounce } from '@fimbul-works/seidr';
 *
 * const saveDraft = debounce((content: string) => {
 *   fetch('/api/drafts', {
 *     method: 'POST',
 *     body: JSON.stringify({ content })
 *   });
 * }, 1000);
 *
 * // This will only save once, even if called multiple times quickly
 * saveDraft('First draft');
 * saveDraft('Updated draft');
 * saveDraft('Final draft');
 * ```
 */
export function debounce<Args extends unknown[]>(
  callback: (...args: Args) => void,
  waitMs: number,
): (...args: Args) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  return (...args: Args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback(...args), waitMs);
  };
}

/**
 * Builds a concatenated className string from various input types.
 *
 * This utility handles flexible class name construction from strings, objects,
 * arrays, functions, and Seidr observables. It's designed to work seamlessly
 * with conditional classes, reactive class bindings, and complex class logic.
 *
 * @param classes - Variable arguments of different types for class construction
 *
 * @returns A clean, space-separated string of unique class names
 *
 * @example
 * Basic string concatenation
 * ```typescript
 * import { cn } from '@fimbul-works/seidr';
 *
 * const className = cn('btn', 'btn-primary', 'large');
 * // Returns: "btn btn-primary large"
 * ```
 *
 * @example
 * Conditional classes with objects
 * ```typescript
 * import { cn } from '@fimbul-works/seidr';
 *
 * const className = cn('btn', {
 *   'btn-primary': isActive,
 *   'btn-disabled': isDisabled,
 *   'loading': isLoading
 * });
 * // Returns: "btn btn-primary loading" (if isActive=true, isDisabled=false, isLoading=true)
 * ```
 *
 * @example
 * Arrays and nested structures
 * ```typescript
 * import { cn } from '@fimbul-works/seidr';
 *
 * const className = cn('btn', ['btn-primary', { 'large': isLarge }]);
 * // Returns: "btn btn-primary large" (if isLarge=true)
 * ```
 *
 * @example
 * Dynamic classes with functions
 * ```typescript
 * import { cn } from '@fimbul-works/seidr';
 *
 * const className = cn('btn', () => 'btn-primary', () => isDisabled && 'disabled');
 * // Returns: "btn btn-primary disabled" (if isDisabled=true)
 * ```
 *
 * @example
 * Reactive classes with Seidr observables
 * ```typescript
 * import { cn, Seidr } from '@fimbul-works/seidr';
 *
 * const isActive = new Seidr(true);
 * const size = new Seidr('large');
 *
 * const className = cn('btn', isActive.as(active => active && 'active'), size);
 * // Returns: "btn active large"
 * ```
 *
 * @example
 * Complex combinations
 * ```typescript
 * import { cn, Seidr } from '@fimbul-works/seidr';
 *
 * const theme = new Seidr('dark');
 * const isLoading = new Seidr(false);
 * const hasError = new Seidr(false);
 *
 * const className = cn(
 *   'component',
 *   theme.as(theme => `theme-${theme.value}`),
 *   ['base-class', { 'loading': isLoading.value }],
 *   () => hasError.value && 'error'
 * );
 * // Returns: "component theme-dark base-class"
 * ```
 */
export const cn = (...classes: unknown[]): string =>
  classes
    .filter(Boolean)
    .flatMap((c: unknown): string =>
      c instanceof Seidr
        ? cn(c.value)
        : Array.isArray(c)
          ? (cn(...c) as string)
          : typeof c === "function"
            ? (cn(c()) as string)
            : typeof c === "object"
              ? Object.entries(c as object)
                  .filter(([, value]) => !!value)
                  .map(([key]) => key)
                  .join(" ")
              : String(c),
    )
    .map((c) => c.trim())
    .filter((value: string, index: number, self: string[]): boolean => self.indexOf(value) === index)
    .filter(Boolean)
    .join(" ");
