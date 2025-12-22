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
