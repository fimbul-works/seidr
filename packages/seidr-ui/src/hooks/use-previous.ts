import { createValue, isValue, onUnmounted, SeidrError, type Value } from "@fimbul-works/seidr";

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
  onUnmounted(value.watch((_newValue, prevValue) => previous(prevValue)));
  return previous.as((v) => v);
}
