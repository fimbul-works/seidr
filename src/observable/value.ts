import { getAppState, getNextValueId } from "../app-state/app-state.js";
import type { AppState } from "../app-state/types.js";
import { TYPE_PROP } from "../constants.js";
import { isNullish, isFn } from "../util/type-guards.js";
import { SeidrError, type CleanupFunction } from "../types.js";
import { defineGetProp, defineValueProp } from "../util/define-prop.js";
import { isServer } from "../util/environment/is-server.js";
import { DATA_KEY_STATE } from "./constants.js";
import { registerValueForSSR } from "./register-value-for-ssr.js";

/** Value observable type string. */
export const TYPE_VALUE = "value";

// Registry to track values that are invoked
const parentValues: Set<Value>[] = [];

/**
 * Value interface, notifies listeners when that value changes.
 * Allows immediate binding to a target, unlike a signal which only notifies on changes.
 *
 * @template T - The type of the value emitted by the value
 */
export interface Value<T = any> {
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
   * Registers a callback that is invoked whenever the observable value changes.
   *
   * @param handler Receives the new value and the previous value.
   * @returns A function that unregisters the callback.
   */
  watch(handler: ValueChangeHandler<T>): CleanupFunction;

  /**
   * Registers a callback that is invoked immediately,
   * and whenever the observable value changes.
   *
   * @param handler Receives the new value and the previous value.
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

  /**
   * Creates a derived Value that automatically transforms this observable's value.
   *
   * @template D - The type of the transformed/derived value
   * @param transformFn Function that transforms the source value to the derived value
   * @param options Options for the new derived Seidr
   * @returns A new Seidr instance containing the transformed value
   */
  as<D>(transformFn: (value: T) => D, options?: ValueOptions): Value<D>;

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
  readonly parents: Value[];
}

/**
 * Type for event handlers that are called when an observable's value changes.
 *
 * @template T - The data type for the event
 * @param {T} value - Data to handle
 * @param {T} prevValue - Previous data value
 */
export type ValueChangeHandler<T> = (value: T, prevValue?: T) => any;

/**
 * Options for creating a value.
 */
export interface ValueOptions {
  /**
   * Unique identifier for this observable.
   */
  id?: string;

  /**
   * Function to check value equality.
   *
   * By default, uses `Object.is` for comparison which means:
   * - `NaN === NaN` (true)
   * - `-0 !== +0` (true, they are different)
   * - Object references are compared by identity
   *
   * To create a "signal" that always notifies (even when the value hasn't changed),
   * use `isEqual: () => false`:
   *
   * @example
   * ```ts
   * import { createValue } from "@fimbul-works/seidr";
   *
   * const signal = createValue(0, { isEqual: () => false });
   * signal.watch((val) => console.log("Always notifies:", val));
   * signal(0); // Notifies even though value is the same
   * ```
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
  parents?: Value[];

  /**
   * Whether to hydrate this observable from server-side data.
   *
   * @default true
   */
  hydrate?: boolean;
}

/**
 * Creates an observable Value,
 * which notifies listeners when that value changes.
 *
 * @template T - The type of the value stored and emitted
 * @param {T} [initialValue] - The initial value
 * @param {ValueOptions} [options={}] - Optional value options (default: `{}`)
 * @returns {Value<T>} A callable function object that can be used to get or set the value and watch for changes
 */
export function createValue<T>(initialValue?: T, options: ValueOptions = {}): Value<T> {
  const { id = getNextValueId(), isEqual: eq = Object.is, parents: p = [], hydrate = true } = options;

  // Register in AppState if available
  let appState: AppState | undefined;
  let states: Map<string, Value> | undefined;

  try {
    appState = getAppState();
    states = appState.getData<Map<string, Value>>(DATA_KEY_STATE) ?? new Map<string, Value>();

    // Check for existing Value instance with same ID when an ID is explicitly specified
    if (options.id && states.has(id)) {
      return states.get(id) as Value<T>;
    }
  } catch {
    if (isServer()) {
      console.warn(
        `Value created with ID "${id}" but no AppState found. You should not create Values outside of the component tree in SSR, due to cross-request contamination.`,
      );
    }
  }

  const handlers = new Set<ValueChangeHandler<T>>();
  const cleanups = new Set<CleanupFunction>();
  const isDerived = p.length > 0;

  let currentValue = initialValue as T;

  // Store parents for getParents() access in tests
  const parentsArray = p;

  // Access to arguments requires a standard function
  function valueGetSetter(newValue?: T | ((prevValue: T) => T)): T {
    if (!arguments.length) {
      if (parentValues.length) {
        parentValues.at(-1)!.add(valueGetSetter as Value);
      }

      return currentValue;
    }

    // Handle functional update
    if (isFn(newValue)) {
      newValue = newValue(currentValue);
    }

    // If the new value is equal to the current value, do not notify listeners
    if (eq(currentValue, newValue as T)) {
      return currentValue;
    }

    const prevValue = currentValue;
    currentValue = newValue as T;
    handlers.forEach((listener) => listener(currentValue, prevValue));
    return prevValue;
  }

  const fn = defineValueProp(valueGetSetter as Value<T>, TYPE_PROP, TYPE_VALUE, false);

  defineValueProp(fn, "id", id, false);

  defineValueProp(fn, "isDerived", isDerived, false);

  if (!process.env.SEIDR_DISABLE_SSR) {
    defineValueProp(fn, "hydrate", hydrate, false);
  }

  defineValueProp(
    fn,
    "watch",
    (handler: ValueChangeHandler<T>): CleanupFunction => (
      !process.env.SEIDR_DISABLE_SSR && registerValueForSSR?.(fn), handlers.add(handler), () => handlers.delete(handler)
    ),
  );

  defineValueProp(
    fn,
    "bind",
    (handler: ValueChangeHandler<T>): CleanupFunction => (
      !process.env.SEIDR_DISABLE_SSR && registerValueForSSR?.(fn),
      handler(currentValue, currentValue),
      fn.watch(handler)
    ),
  );

  defineValueProp(fn, "cleanup", (cleanupFn: CleanupFunction) => cleanups.add(cleanupFn));

  defineValueProp(fn, "destroy", () => (handlers.clear(), cleanups.forEach((fn) => fn()), cleanups.clear()));

  defineValueProp(fn, "as", <D>(transformFn: (value: T) => D, options: ValueOptions = {}) =>
    mergeValues(() => transformFn(fn()), options),
  );

  defineGetProp(fn, "parents", () => parentsArray.slice());
  defineGetProp(fn, "observerCount", () => handlers.size);

  // Register instance in AppState
  if (!isNullish(appState!) && !isNullish(states!)) {
    states.set(id, fn);
    appState.setData(DATA_KEY_STATE, states);
  }

  // Restore from hydration data if applicable
  if (!process.env.SEIDR_DISABLE_SSR && !isServer()) {
    registerValueForSSR?.(fn);
  }

  return fn;
}

/**
 * Creates a derived value by a merging function.
 *
 * @template T - The type of the value stored and emitted
 * @param {() => T} [mergeFn] - The function that returns the derived value
 * @param {ValueOptions} [options={}] - The initial value (default: `{}`)
 * @returns {Value<T>} A callable function object that can be used to get or set the value and watch for changes
 */
export function mergeValues<T>(mergeFn: () => T, options: ValueOptions = {}): Value<T> {
  parentValues.push(new Set(options.parents ?? []));
  try {
    const initialValue = mergeFn();
    const parents = Array.from(parentValues.at(-1)!);

    if (parentValues.length === 0) {
      throw new SeidrError("Merged Value must have at least one parent");
    }

    const derived = createValue<T>(initialValue, { ...options, parents: parents });
    parents.forEach((parent) => derived.cleanup(parent.watch(() => derived(mergeFn()) as void)));
    return derived;
  } finally {
    parentValues.pop();
  }
}
