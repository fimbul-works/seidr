import type { Seidr } from "../seidr/seidr";

export type BindInputInterface = {
  value: Seidr<string>;
  oninput: (e: Event) => void;
};

/**
 * Creates a two-way binding helper object for form inputs.
 *
 * @param {Seidr<string>} observable - The observable to bind to the input
 * @returns {{value: Seidr<string>, oninput: (e: Event) => void}} Object containing value and oninput handler
 */
export function bindInput(observable: Seidr<string>): { value: Seidr<string>; oninput: (e: Event) => void } {
  return {
    value: observable,
    oninput: (e: Event) => {
      observable.value = (e.target as HTMLInputElement).value;
    },
  };
}
