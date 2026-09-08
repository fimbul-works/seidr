import type { Value } from "./value.js";

/**
 * Wraps a Seidr `Value<T>` in an object with a getter and setter property.
 *
 * This provides an OOP (Object-Oriented Programming) accessor bridge for reactive
 * Values, allowing libraries that operate on object property mutations (such as the
 * Flaedi animation library or other tweening/property-based tools) to read and update
 * reactive state transparently.
 *
 * @template T - The type of value stored in the observable.
 * @template K - The property key name on the returned object (defaults to `"value"`).
 * @param {Value<T>} value - The reactive `Value<T>` observable to wrap.
 * @param {K} [key="value" as K] - The property key on the resulting object.
 * @returns {Record<K, T>} An object with getter and setter accessors bound to the `Value`.
 *
 * @example
 * ```typescript
 * const count = createValue(0);
 * const target = wrapValueObject(count);
 *
 * console.log(target.value); // 0 (calls count())
 * target.value = 10;        // Calls count(10)
 * console.log(count());     // 10
 * ```
 *
 * @example
 * ```typescript
 * // Using a custom property key for animation targets
 * const opacity = createValue(0);
 * const animTarget = wrapValueObject(opacity, "opacity");
 *
 * animTarget.opacity = 0.5; // updates opacity observable
 * ```
 */
export const wrapValueObject = <T, K extends string = "value">(
  value: Value<T>,
  key: K = "value" as K,
): Record<K, T> =>
  ({
    get [key]() {
      return value();
    },

    set [key](newValue: T) {
      value(newValue);
    },
  }) as Record<K, T>;
