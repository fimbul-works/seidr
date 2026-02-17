import type { CleanupFunction } from "src/types";
import type { Seidr, SeidrOptions } from "./seidr";
import type { Weave } from "./seidr-weave";

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
   * Creates a derived observable value that automatically updates when its dependencies change.
   *
   * @template D - The return type of the derived value
   *
   * @param {(value: T) => D} transformFn - Function that transforms the source value to the derived value
   * @param {SeidrOptions} [options] - Options for the new derived Seidr
   * @returns {Seidr<D>} A new Seidr instance containing the transformed value
   */
  as<D>(transformFn: (value: T) => D, options?: SeidrOptions): D extends object ? Weave<D> | Seidr<D> : Seidr<D>;

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
}

/**
 * Basic observable interface.
 */
export interface ObservableObject<T extends object = object, K extends keyof T = keyof T> extends Observable<T> {
  /**
   * Subscribes to value changes with an event handler.
   * Unlike `bind`, this function will only be called when the value changes.
   *
   * @param {(values: T) => void} changed - Function to be called when the value changes
   * @returns {CleanupFunction} A cleanup function that removes the event handler
   */
  observe(changed: (values: T) => void, keys?: K[]): CleanupFunction;

  /**
   * Creates a reactive binding between this observable and a target.
   * Unlike `observe`, this function will call the handler immediately with the current value.
   *
   * @template O - The type being bound to
   * @param {O} target - The value to apply changes to
   * @param {(value: T, target: O) => void} bindFn - Function to bind the observable's value to the target
   * @returns {CleanupFunction} A cleanup function that removes the binding when called
   */
  bind<O>(target: O, bindFn: (values: T, target: O) => void, keys?: K[]): CleanupFunction;

  keys(): K[];
  values(): (Seidr<T[K]> | Weave<any>)[];
  entries(): [K, Seidr<T[K]> | Weave<any>][];
}
