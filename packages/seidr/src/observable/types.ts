import { TYPE_PROP } from "../constants.js";
import type { CleanupFunction } from "../types.js";
import type { TYPE_REF, TYPE_VALUE } from "./constants.js";

/**
 * Type for event handlers that are called when an observable's value changes.
 *
 * @template T - The data type for the event
 * @param {T} value - Data to handle
 * @param {T} prevValue - Previous data value
 * @returns {CleanupFunction | unknown} - Optional cleanup function or any value (which is ignored)
 */
export type ValueChangeHandler<T> = (value: T, prevValue: T) => CleanupFunction | unknown;

/**
 * Basic observable interface.
 */
export interface Observable<T = any> {
  /**
   * Returns the current value.
   */
  (): T;

  /**
   * Registers a callback that is invoked whenever the value changes.
   *
   * @param handler Receives the new value and the previous value.
   * @returns A function that unregisters the callback.
   */
  watch(handler: ValueChangeHandler<T>): CleanupFunction;

  /**
   * Registers a callback that is invoked immediately,
   * and whenever the value changes.
   *
   * @param handler Receives the new value and the previous value.
   * @returns A function that unregisters the callback.
   */
  bind(handler: ValueChangeHandler<T>): CleanupFunction;

  /**
   * Removes all registered callbacks.
   *
   * After calling this method, no further callbacks will be invoked
   * unless new callbacks are registered.
   */
  destroy(): void;
}

/**
 * Value interface, implementing a getter-setter pattern.
 * Notifies listeners when that value changes.
 * Allows immediate binding to a target.
 *
 * @template T - The type of the value emitted by the value
 */
export interface Value<T = any> extends Observable<T> {
  readonly [TYPE_PROP]: typeof TYPE_VALUE;

  /**
   * Unique identifier.
   */
  readonly id: string;

  /**
   * Whether this value is derived from other values.
   */
  readonly isDerived: boolean;

  /**
   * Whether to hydrate this value from server-side data.
   */
  readonly hydrate: boolean;

  /**
   * Returns the current value.
   */
  (): T;

  /**
   * Sets a new value.
   *
   * @param newValue The new value, or a function that transforms the previous value into the new value.
   * @returns The previous value.
   */
  (newValue: T | ((prevValue: T) => T)): T;

  /**
   * Registers a callback that is invoked whenever the value changes.
   *
   * @param handler Receives the new value and the previous value.
   * @returns A function that unregisters the callback.
   */
  watch(handler: ValueChangeHandler<T>): CleanupFunction;

  /**
   * Registers a callback that is invoked immediately,
   * and whenever the value changes.
   *
   * @param handler Receives the new value and the previous value.
   * @returns A function that unregisters the callback.
   */
  bind(handler: ValueChangeHandler<T>): CleanupFunction;

  /**
   * Removes all registered callbacks.
   *
   * After calling this method, no further callbacks will be invoked
   * unless new callbacks are registered.
   */
  destroy(): void;

  /**
   * Creates a derived Value that automatically transforms this observable's value.
   *
   * @template D - The type of the transformed/derived value
   * @param transformFn Function that transforms the source value to the derived value
   * @param options Options for the new derived value
   * @returns A new observable value containing the transformed value
   */
  as<D>(transformFn: (value: T) => D, options?: DerivedValueOptions): DerivedValue<D>;

  /**
   * Register a cleanup function that is called when the observable is destroyed.
   *
   * @param fn The cleanup function to register.
   * @internal
   */
  cleanup(fn: CleanupFunction): void;

  /**
   * Returns the number of active observers.
   *
   * @internal
   */
  readonly observerCount: number;

  /**
   * Returns the parent values that this value derives from.
   *
   * @internal
   */
  readonly parents: Observable[];
}

/**
 * Options for creating a Value.
 */
export interface ValueOptions {
  /**
   * Unique identifier for this observable.
   */
  id?: string;

  /**
   * Function to check value equality.
   *
   * @param a Current value for comparison.
   * @param b New value for comparison.
   * @returns `true` if values are equal, `false` otherwise.
   * @default Object.is
   */
  isEqual?: (a: any, b: any) => boolean;

  /**
   * Parent values for derived values.
   *
   * @default []
   * @internal
   */
  parents?: Observable[];

  /**
   * Whether to hydrate this observable from server-side data.
   *
   * @default true
   */
  hydrate?: boolean;
}

/**
 * A derived Value interface.
 *
 * @template T - The type of the value emitted by the value
 */
export interface DerivedValue<T = any> extends Observable<T> {
  readonly [TYPE_PROP]: typeof TYPE_VALUE;

  /**
   * Unique identifier.
   */
  readonly id: string;

  /**
   * Whether this value is derived from other values.
   */
  readonly isDerived: true;

  /**
   * Whether to hydrate this value from server-side data.
   */
  readonly hydrate: false;

  /**
   * Returns the current value.
   */
  (): T;

  /**
   * Registers a callback that is invoked whenever the value changes.
   *
   * @param handler Receives the new value and the previous value.
   * @returns A function that unregisters the callback.
   */
  watch(handler: ValueChangeHandler<T>): CleanupFunction;

  /**
   * Registers a callback that is invoked immediately,
   * and whenever the value changes.
   *
   * @param handler Receives the new value and the previous value.
   * @returns A function that unregisters the callback.
   */
  bind(handler: ValueChangeHandler<T>): CleanupFunction;

  /**
   * Removes all registered callbacks.
   *
   * After calling this method, no further callbacks will be invoked
   * unless new callbacks are registered.
   */
  destroy(): void;

  /**
   * Creates a derived Value that automatically transforms this observable's value.
   *
   * @template D - The type of the transformed/derived value
   * @param transformFn Function that transforms the source value to the derived value
   * @param options Options for the new derived value
   * @returns A new observable value containing the transformed value
   */
  as<D>(transformFn: (value: T) => D, options?: DerivedValueOptions): DerivedValue<D>;

  /**
   * Register a cleanup function that is called when the observable is destroyed.
   *
   * @param fn The cleanup function to register.
   * @internal
   */
  cleanup(fn: CleanupFunction): void;

  /**
   * Returns the number of active observers.
   *
   * @internal
   */
  readonly observerCount: number;

  /**
   * Returns the parent values that this value derives from.
   *
   * @internal
   */
  readonly parents?: Observable[];
}

/**
 * Options for creating a derived Value, excluding parent and hydration settings.
 */
export type DerivedValueOptions = Omit<ValueOptions, "id" | "hydrate">;

/**
 * A observable value can be a Value or a DerivedValue.
 */
export type ObservableValue<T> = Value<T> | DerivedValue<T>;

/**
 * Ref object.
 */
export interface Ref<T = any> extends Observable<T> {
  readonly [TYPE_PROP]: typeof TYPE_REF;

  /**
   * Returns the current value.
   */
  (): T | null;

  /**
   * Sets a new value.
   *
   * @param newValue - The new value
   */
  (newValue: T | null): void;

  /**
   * Registers a callback that is invoked whenever the ref's value changes.
   *
   * @param handler Receives the new ref value and the previous ref value.
   * @returns A function that unregisters the callback.
   */
  watch(handler: ValueChangeHandler<T>): CleanupFunction;

  /**
   * Registers a callback that is invoked immediately,
   * and whenever the ref's value changes.
   *
   * @param handler Receives the new ref value and the previous ref value.
   * @returns A function that unregisters the callback.
   */
  bind(handler: ValueChangeHandler<T>): CleanupFunction;

  /**
   * Removes all registered watchers.
   *
   * After calling this method, no further watcher callbacks will be invoked
   * unless new watchers are registered.
   */
  destroy(): void;
}
