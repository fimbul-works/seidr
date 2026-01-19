import type { Seidr } from "../seidr";
import { createStateKey } from "./create-key";
import { getState } from "./get";
import { hasState } from "./has";
import { setState } from "./set";
import type { StateKey } from "./types";

/**
 * Creates a getter/setter function for a specific state key.
 *
 * This utility simplifies state management by returning a single function that can act as both
 * a getter and a setter depending on how it's called.
 *
 * @example
 * ```ts
 * const count = getSetState<number>("count");
 * count(0);              // Initialize state
 * const prev = count(5); // prev = 0 (the old value)
 * const curr = count();  // curr = 5 (the new value)
 * ```
 *
 * @template T - The type of the state value
 * @param {StateKey<T> | string} key - Unique string key for the state
 * @returns {(value?: T) => T | undefined} A function that returns the current value if called with no arguments,
 *                                         or updates the state and returns the previous value if called with an argument.
 *                                         Returns undefined if the state has not been initialized.
 *
 * The returned function **always returns the current state value** (the value *before* any update occurs).
 * This allows you to set a new value while receiving the previous one for comparison.
 */
export function getSetState<T>(key: StateKey<T> | string): (...args: T[]) => T | undefined {
  return (...args: T[]) => {
    // Resolve key lazily to ensure we use the correct RenderContext in SSR
    if (typeof key === "string") {
      key = createStateKey<T>(key);
    }

    const previousValue: T | undefined = getState(key);
    // Updatet new value
    if (args.length > 0) {
      setState(key, args[0]);
    }

    // Return previously set value if any
    return previousValue;
  };
}
