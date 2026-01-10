import type { Seidr } from "./seidr";

/**
 * Error callback type for withStorage error handling.
 *
 * @param error - The error that occurred
 * @param operation - The type of storage operation that failed ('read' or 'write')
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
 * @example
 * Error handling with Safe component
 * ```typescript
 * import { withStorage, Safe, $, Seidr } from '@fimbul-works/seidr';
 *
 * Safe(() => {
 *   const settings = withStorage('settings', new Seidr({ theme: 'light' }));
 *   return $('div', `Theme: ${settings.value.theme}`);
 * }, {
 *   fallback: (error) => $('div', {
 *     style: 'color: red',
 *     textContent: `Storage error: ${error.message}. Please clear your browser data.`
 *   })
 * });
 * ```
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
 *
 * @throws {Error} If storage read/write fails and no onError handler is provided
 *
 * @example
 * Basic usage with localStorage
 * ```typescript
 * import { Seidr, withStorage } from '@fimbul-works/seidr';
 *
 * const userPreferences = withStorage(
 *   'user-preferences',
 *   new Seidr({ theme: 'dark', language: 'en' })
 * );
 *
 * // Value is automatically loaded from localStorage if it exists
 * // Changes are automatically saved to localStorage
 * userPreferences.value = { theme: 'light', language: 'es' };
 * ```
 *
 * @example
 * Using sessionStorage for temporary data
 * ```typescript
 * import { Seidr, withStorage } from '@fimbul-works/seidr';
 *
 * const formData = withStorage(
 *   'checkout-form',
 *   new Seidr({ name: '', email: '' }),
 *   sessionStorage // Data persists only for the session
 * );
 *
 * // Form data persists across page reloads but clears when tab closes
 * formData.value = { name: 'John Doe', email: formData.value.email };
 * ```
 *
 * @example
 * Custom error handling with onError callback
 * ```typescript
 * import { Seidr, withStorage } from '@fimbul-works/seidr';
 *
 * const settings = withStorage(
 *   'app-settings',
 *   new Seidr({ volume: 50 }),
 *   localStorage,
 *   (error, operation) => {
 *     console.error(`Storage ${operation} failed:`, error);
 *     // Send to error tracking service
 *     Sentry.captureException(error);
 *     // Show user notification
 *     showNotification('Settings could not be saved');
 *   }
 * );
 * ```
 *
 * @example
 * Simple counter with persistence
 * ```typescript
 * import { Seidr, withStorage, $div, $button, $span } from '@fimbul-works/seidr';
 *
 * const counter = withStorage('visit-counter', new Seidr(0));
 *
 * const counterDisplay = $div({}, [
 *   $span({ textContent: counter.as(c => `Visits: ${c}`) }),
 *   $button({
 *     textContent: 'Reset',
 *     onclick: () => counter.value = 0
 *   })
 * ]);
 *
 * // Counter persists across page reloads
 * counter.value++; // Automatically saves to localStorage
 * ```
 *
 * @example
 * Complex object persistence
 * ```typescript
 * import { Seidr, withStorage } from '@fimbul-works/seidr';
 *
 * type TodoItem = { id: number; text: string; completed: boolean };
 *
 * const todos = withStorage(
 *   'todo-list',
 *   new Seidr<TodoItem[]>([])
 * );
 *
 * // Complex arrays are automatically serialized/deserialized
 * todos.value = [
 *   { id: 1, text: 'Learn Seidr', completed: true },
 *   { id: 2, text: 'Build amazing apps', completed: false }
 * ];
 * ```
 */
export function withStorage<T extends Seidr<any>>(
  key: string,
  seidr: T,
  storage: Storage = typeof window !== "undefined" ? localStorage : ({} as Storage),
  onError?: StorageErrorHandler,
): T {
  // Server-side rendering: storage APIs don't exist, so return Seidr unchanged
  if (typeof window === "undefined") {
    return seidr;
  }

  // Load initial value from storage
  try {
    const initial = storage.getItem(key);
    if (initial !== null) {
      seidr.value = JSON.parse(initial);
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    if (onError) {
      onError(err, "read");
    } else {
      throw new Error(`Failed to read from storage (key="${key}"): ${err.message}`);
    }
  }

  // Observe changes and save to storage
  seidr.observe((value) => {
    try {
      storage.setItem(key, JSON.stringify(value));
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      if (onError) {
        onError(err, "write");
      } else {
        throw new Error(`Failed to write to storage (key="${key}"): ${err.message}`);
      }
    }
  });

  return seidr;
}
