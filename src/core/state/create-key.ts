import { symbolNames } from "./storage";
import type { StateKey } from "./types";

/**
 * Create a new state key with associated type.
 *
 * This function is used to access the type-safe application state.
 *
 * @template T - State type
 *
 * @param {string} key - Key for the state
 * @returns {StateKey<T>} Symbol that contains the key for the state
 */
export function createStateKey<T>(key: string): StateKey<T> {
  if (symbolNames.has(key)) {
    return symbolNames.get(key) as StateKey<T>;
  }
  const symbol = Symbol(key) as StateKey<T>;
  symbolNames.set(key, symbol);
  return symbol;
}
