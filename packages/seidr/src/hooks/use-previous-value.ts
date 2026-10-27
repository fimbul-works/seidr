import { isValue } from "../observable/type-guards.js";
import type { Value } from "../observable/types.js";
import { createValue } from "../observable/value.js";
import { SeidrError } from "../types.js";

/**
 * Creates a `Value<T>` that holds the previous value of a given `Value<T>`.
 *
 * @template {T} The type of value to observe.
 * @param {Value<T>} value - The value to observe.
 * @returns {Value<T>} A value that holds the previous value of the given value.
 * @throws {SeidrError} If the value is invalid.
 */
export function usePreviousValue<T>(value: Value<T>): Value<T> {
  if (!isValue(value) && process.env.NODE_ENV !== "production") {
    throw new SeidrError("Invalid value");
  }

  const previous = createValue<T>(value());
  value.watch((_newValue, prevValue) => previous(prevValue));
  return previous;
}
