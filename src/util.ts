import { ObservableValue } from "./value.js";

/**
 * Call HTMLElement.querySelector
 * @template T - HTMLElement to expect
 * @param query - Query string
 * @param el - Element to query from (default: document.body)
 * @returns {T | null} First element matching the query string
 */
export const $ = <T extends HTMLElement>(query: string, el: HTMLElement = document.body): T | null =>
  el.querySelector(query);

/**
 * Call HTMLElement.querySelectorAll
 * @template T - HTMLElement to expect
 * @param query - Query string
 * @param el - Element to query from (default: document.body)
 * @returns {Array<T>} An array of elements matching the query string
 */
export const $$ = <T extends HTMLElement>(query: string, el: HTMLElement = document.body): T[] =>
  Array.from(el.querySelectorAll(query));

/**
 * Debounce calling a function by a certain amount of time.
 * @param callback - Callback to invoke after `waitMs` has expired
 * @param waitMs - Milliseconds to wait before invoking the callback
 * @returns Debounced callback
 */
export function debounce(callback: (...args: unknown[]) => void, waitMs: number): typeof callback {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  return (...args: unknown[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback(...args), waitMs);
  };
}

/**
 * Build a list of className strings from an assorted types of values.
 * @param classes - An array of potential values
 * @returns A string of class names
 */
export const cn = (...classes: unknown[]): string =>
  classes
    .filter(Boolean)
    .flatMap((c: unknown): string =>
      c instanceof ObservableValue
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
    .filter((value: string, index: number, self: string[]): boolean => self.indexOf(value) === index)
    .map((c) => c.trim())
    .filter(Boolean)
    .join(" ");
