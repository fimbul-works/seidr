import { isFn, isStr } from "@fimbul-works/hvat";
import { isHydrating } from "../ssr/hydrate/storage.js";
import { SeidrError } from "../types.js";
import { isClient } from "../util/environment/is-client.js";
import { wrapError } from "../util/wrap-error.js";
import type { Value } from "./types.js";
import type { Unwrapped } from "./unwrap-value.js";

/**
 * Error callback type for withStorage error handling.
 *
 * @param {SeidrError} error - The error that occurred
 * @param {"read" | "write"} operation - The type of storage operation that failed (`"read"` or `"write"`)
 */
export type StorageErrorHandler = (error: SeidrError, operation: "read" | "write") => void;

/**
 * Callback function to execute when the value being restored to has been hydrated after SSR.
 * @template T - The observable Value instance type
 * @param {Value<T>} value - The observable Value instance
 * @param {T} storageValue - The value read from storage
 */
export type OnHydratedValueHandler<T> = (value: Value<T>, storageValue: T) => void;

/**
 * Options for the `withStorage` function.
 *
 * @template T - The observable Value instance type
 */
export interface WithStorageOptions<T = any> {
  /** The storage API to use (default: `localStorage`) */
  storage?: Storage;
  /** Optional error handler to handle errors instead of being thrown */
  onError?: StorageErrorHandler;
  /** Callback function to execute when the value being restored to has been hydrated after SSR */
  onHydrated?: OnHydratedValueHandler<T>;
}

/**
 * Synchronizes a Value observable with browser storage (localStorage or sessionStorage).
 *
 * This function creates a two-way binding between a Value observable and browser storage,
 * enabling automatic persistence and restoration of reactive state across page reloads
 * and browser sessions.
 *
 * ⚠️ **ERROR HANDLING REQUIRED**
 *
 * Storage operations can fail due to:
 * - Quota exceeded (localStorage limit: ~5-10MB)
 * - Access denied (privacy mode, CORS restrictions)
 * - Corrupted data (invalid JSON)
 * - Storage unavailable (older browsers, disabled storage)
 *
 * By default, `withStorage` throws on errors. Wrap components using withStorage in a
 * `<Safe>` boundary to handle errors gracefully:
 *
 * @template T - The observable Value instance type
 *
 * @param {string} key - The storage key to use for persisting the observable value
 * @param {T} observable - The observable to bind to storage
 * @param {Storage} [storage=localStorage] - The storage API to use (default: `localStorage`)
 * @param {StorageErrorHandler} [onError] - Optional error handler to handle errors instead of being thrown
 * @returns {T} The same Value instance, now with storage synchronization enabled
 * @throws {SeidrError} If storage read/write fails and no onError handler is provided
 */
export const withStorage = <T extends Value, V = Unwrapped<T>>(
  key: string,
  value: T,
  options: WithStorageOptions<V> = {},
): T => {
  // Server-side rendering: storage APIs don't exist, so return Value unchanged
  if (!isClient()) {
    return value;
  }
  const { storage = window.localStorage, onError, onHydrated } = options;

  // Load initial value from storage
  try {
    const initial = storage.getItem(key);
    if (isStr(initial)) {
      const storedValue = JSON.parse(initial);
      // Check to see if the value being stored is hydrateable, and if the user has provided an onHydrated handler
      if (!process.env.SEIDR_DISABLE_SSR && isHydrating() && value.hydrate && isFn(onHydrated)) {
        onHydrated(value, storedValue);
      } else {
        value(storedValue);
      }
    }
  } catch (error) {
    const err = wrapError(error);
    if (onError) {
      onError(err, "read");
    } else {
      throw new SeidrError(`Failed to read from storage (key="${key}"): ${err.message}`);
    }
  }

  // Observe changes and save to storage
  value.watch((value) => {
    try {
      storage.setItem(key, JSON.stringify(value));
    } catch (error) {
      const err = wrapError(error);
      if (onError) {
        onError(err, "write");
      } else {
        throw new SeidrError(`Failed to write to storage (key="${key}"): ${err.message}`);
      }
    }
  });

  return value;
};
