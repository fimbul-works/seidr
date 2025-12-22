import type { Seidr } from "./seidr.js";

/**
 * Synchronizes a Seidr observable with browser storage (localStorage or sessionStorage).
 *
 * This function creates a two-way binding between a Seidr observable and browser storage,
 * enabling automatic persistence and restoration of reactive state across page reloads
 * and browser sessions.
 *
 * @template T - The Seidr instance type (inferred from the provided seidr parameter)
 *
 * @param key - The storage key to use for persisting the observable value
 * @param seidr - The Seidr observable to bind to storage
 * @param storage - The storage API to use (defaults to localStorage)
 *
 * @returns The same Seidr instance, now with storage synchronization enabled
 *
 * @throws {JSONError} If the stored value cannot be parsed as JSON
 * @throws {QuotaExceededError} If storage quota is exceeded
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
export const withStorage = <T extends Seidr<any>>(key: string, seidr: T, storage: Storage = localStorage): T => {
  const initial = storage.getItem(key);
  if (initial) {
    seidr.value = JSON.parse(initial);
  }
  seidr.observe((value) => storage.setItem(key, JSON.stringify(value)));
  return seidr;
};
