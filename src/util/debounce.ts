/**
 * Creates a debounced version of a function that delays execution.
 *
 * Debouncing ensures that a function is only executed once after a specified
 * delay period, even if it's called multiple times during that period.
 * This is particularly useful for event handlers, API calls, and search
 * functionality to prevent excessive execution.
 *
 * @template {unknown[]} Args - The argument types for the callback function
 *
 * @param {(...args: Args) => void} callback - The function to debounce
 * @param {number} waitMs - The delay in milliseconds before executing the callback
 * @returns {(...args: Args) => void} A debounced version of the callback function
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
