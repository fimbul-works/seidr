import { getCurrentComponent } from "../component/component-stack";
import { type CleanupFunction, SeidrError } from "../types";
import { isClient } from "../util/environment/browser";
import { isServer } from "../util/environment/server";
import { isEmpty } from "../util/type-guards/primitive-types";
import { wrapError } from "../util/wrap-error";
import type { Seidr } from "./seidr";

/**
 * Error callback type for useStorage error handling.
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
 * @template T - The type of the Seidr observable to bind to storage
 *
 * @param {string} key - The storage key to use for persisting the observable value
 * @param {Seidr<T>} seidr - The Seidr observable to bind to storage
 * @param {Storage} [storage=localStorage] - The storage API to use (defaults to localStorage)
 * @param {StorageErrorHandler} [onError] - Optional error handler. If provided, errors
 *   will be passed to this handler instead of being thrown. Useful for custom error
 *   handling or logging.
 *
 * @returns {CleanupFunction} Cleanup function to remove the storage synchronization
 * @throws {Error} If storage read/write fails and no onError handler is provided
 */
export function useStorage<T>(
  key: string,
  seidr: Seidr<T>,
  storage: Storage = isClient() ? localStorage : ({} as Storage),
  onError?: StorageErrorHandler,
): CleanupFunction {
  // Server-side rendering: storage APIs don't exist, so return Seidr unchanged
  if (isServer()) {
    return () => {};
  }

  const handleError = (err: unknown, operation: "read" | "write") => {
    const error = wrapError(err);
    if (onError) {
      onError(error, operation);
    } else {
      throw new SeidrError(`Failed to ${operation} from storage (key: ${key}): ${error.message}`, seidr);
    }
  };

  // Load initial value from storage
  try {
    const initial = storage.getItem(key);
    if (!isEmpty(initial)) {
      seidr.value = JSON.parse(initial);
    }
  } catch (error) {
    handleError(error, "read");
  }

  // Observe changes and save to storage
  const cleanup = seidr.observe((value) => {
    try {
      storage.setItem(key, JSON.stringify(value));
    } catch (error) {
      handleError(error, "write");
    }
  });

  // Cleanup on component unmount
  getCurrentComponent()?.scope.track(cleanup);

  return cleanup;
}
