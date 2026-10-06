import type { Value } from "../observable/value.js";

/**
 * Interface for two-way binding helper object.
 */
export type BindInputInterface = {
  /**
   * The observable to bind to the input.
   */
  value: Value<string>;

  /**
   * The oninput handler for the input.
   */
  oninput: (e: Event) => void;
};

/**
 * Creates a two-way binding helper object for form inputs.
 *
 * @param {Value<string>} value - The observable to bind to the input
 * @returns {BindInputInterface} Object containing value and oninput handler
 */
export const bindInput = (value: Value<string>): BindInputInterface => ({
  value,
  oninput: (e: Event) => value((e.target as HTMLInputElement).value),
});
