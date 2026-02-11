import type { Seidr } from "../seidr/seidr";

/**
 * Interface for two-way binding helper object.
 */
export type BindInputInterface = {
  /**
   * The observable to bind to the input.
   */
  value: Seidr<string>;

  /**
   * The oninput handler for the input.
   */
  oninput: (e: Event) => void;
};

/**
 * Creates a two-way binding helper object for form inputs.
 *
 * @param {Seidr<string>} observable - The observable to bind to the input
 * @returns {BindInputInterface} Object containing value and oninput handler
 */
export const bindInput = (observable: Seidr<string>): BindInputInterface => ({
  value: observable,
  oninput: (e: Event) => (observable.value = (e.target as HTMLInputElement).value),
});
