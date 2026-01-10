import type { Seidr } from "../seidr";

/**
 * Creates a two-way binding helper object for form inputs.
 *
 * @param observable - The observable to bind to the input
 * @returns Object containing value and oninput handler
 *
 * @example
 * ```typescript
 * const text = new Seidr('');
 * $input({
 *   ...bindInput(text),
 *   placeholder: 'Type here...'
 * });
 * ```
 */
export function bindInput(observable: Seidr<string>) {
  return {
    value: observable,
    oninput: (e: Event) => {
      observable.value = (e.target as HTMLInputElement).value;
    },
  };
}
