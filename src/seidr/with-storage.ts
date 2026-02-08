import { getCurrentComponent } from "../component/component-stack";
import { SeidrError } from "../types";
import { isClient } from "../util/environment/browser";
import { isServer } from "../util/environment/server";
import { isEmpty } from "../util/type-guards/primitive-types";
import { wrapError } from "../util/wrap-error";
import type { Seidr } from "./seidr";

/**
 * Error callback type for withStorage error handling.
 *
 * @param {Error} error - The error that occurred
 * @param {"read" | "write"} operation - The type of storage operation that failed ('read' or 'write')
 */
export type StorageErrorHandler = (error: Error, operation: "read" | "write") => void;

/**
 * Synchronizes a Seidr observable with browser storage (localStorage or sessionStorage).
 *
 * This function creates a two-way binding between a Seidr observable and browser storage,
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
 * By default, withStorage throws on errors. Wrap components using withStorage in a
 * `<Safe>` boundary to handle errors gracefully:
 *
 * @template {Seidr} T - The Seidr instance type (inferred from the provided seidr parameter)
 *
 * @param {string} key - The storage key to use for persisting the observable value
 * @param {T} seidr - The Seidr observable to bind to storage
 * @param {Storage} [storage=localStorage] - The storage API to use (defaults to localStorage)
 * @param {StorageErrorHandler} [onError] - Optional error handler. If provided, errors
 *   will be passed to this handler instead of being thrown. Useful for custom error
 *   handling or logging.
 *
 * @returns {T} The same Seidr instance, now with storage synchronization enabled
 * @throws {Error} If storage read/write fails and no onError handler is provided
 */
export function withStorage<T extends Seidr<any>>(
  key: string,
  seidr: T,
  storage: Storage = isClient() ? localStorage : ({} as Storage),
  onError?: StorageErrorHandler,
): T {
  // Server-side rendering: storage APIs don't exist, so return Seidr unchanged
  if (isServer()) {
    return seidr;
  }

  // Load initial value from storage
  try {
    const initial = storage.getItem(key);
    if (!isEmpty(initial)) {
      seidr.value = JSON.parse(initial);
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
  const cleanup = seidr.observe((value) => {
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

  // Cleanup on component unmount
  getCurrentComponent()?.scope.track(cleanup);

  return seidr;
}
