import { isValue } from "../observable/type-guards.js";
import { createValue, type Value } from "../observable/value.js";
import { SeidrError } from "../types.js";
import { onUnmounted } from "./on-unmounted.js";

/**
 * Creates a `Value<T>` that holds the previous value of a given `Value<T>`.
 *
 * @template {T} The type of value to observe.
 * @param {Value<T>} value - The value to observe.
 * @returns {Value<T>} A value that holds the previous value of the given value.
 * @throws {SeidrError} If the value is invalid.
 */
export function usePrevious<T>(value: Value<T>): Value<T> {
  if (!isValue(value)) {
    throw new SeidrError("Invalid value");
  }

  const previous = createValue<T>(value());
  const unwatch = value.watch((_newValue, prevValue) => previous(prevValue));
  try {
    onUnmounted(unwatch);
  } catch {
    // onUnmounted throws when called outside of component hierarchy
  }
  return previous.as((v) => v);
}
