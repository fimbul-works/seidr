import type { CleanupFunction } from "../types";

/**§
 * Options for Seidr instances.
 */
export interface ObservableOptions {
  /**
   * Unique identifier for this observable
   */
  id?: string;

  /**
   * Whether to hydrate this observable from server-side data
   */
  hydrate?: boolean;

  /**
   * Whether to notify observers synchronously.
   * If false (default), notifications are batched via microtasks.
   */
  sync?: boolean;
}

/**
 * Basic observable interface.
 */
export interface Observable<T> {
  /**
   * Subscribes to value changes with an event handler.
   * Unlike `bind`, this function will only be called when the value changes.
   *
   * @param {(values: T) => void} changed - Function to be called when the value changes
   * @returns {CleanupFunction} A cleanup function that removes the event handler
   */
  observe(changed: (values: T) => void): CleanupFunction;

  /**
   * Creates a reactive binding between this observable and a target.
   * Unlike `observe`, this function will call the handler immediately with the current value.
   *
   * @template O - The type being bound to
   * @param {O} target - The value to apply changes to
   * @param {(value: T, target: O) => void} bindFn - Function to bind the observable's value to the target
   * @returns {CleanupFunction} A cleanup function that removes the binding when called
   */
  bind<O>(target: O, bindFn: (values: T, target: O) => void): CleanupFunction;

  /**
   * Returns the number of active observers.
   *
   * @returns {number} The number of active observers
   */
  observerCount(): number;

  /**
   * Removes all observers and executes all registered cleanup functions.
   */
  destroy(): void;

  /**
   * Returns the current state as a plain object.
   *
   * @returns {T} The current state as a plain object
   */
  toJSON(): T;
}
