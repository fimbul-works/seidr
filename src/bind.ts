import type { CleanupFunction, ObservableValue } from "./value.js";

/**
 * Creates a reactive binding between an ObservableValue and a target.
 *
 * The onChange function is called immediately with the current value, and then
 * automatically called whenever the observable changes. Returns a cleanup function
 * that removes the binding when called.
 *
 * @template T - The type of value stored in the observable
 * @template E - The type being bound to
 *
 * @param observable - The ObservableValue to bind to the element
 * @param target - The value to apply changes to
 * @param onChange - Function that applies the observable's value to the value
 *
 * @returns A cleanup function that removes the binding when called
 */
export function bind<T, E>(
  observable: ObservableValue<T>,
  target: E,
  onChange: (value: T, el: E) => void,
): CleanupFunction {
  onChange(observable.value, target);
  return observable.observe((value) => onChange(value, target));
}
