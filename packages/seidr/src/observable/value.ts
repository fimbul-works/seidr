import { isFn } from "@fimbul-works/hvat";
import { getAppState } from "../app-state/app-state.js";
import type { AppState } from "../app-state/types.js";
import { getComponentScope } from "../component/component-scope.js";
import { TYPE_PROP } from "../constants.js";
import { type CleanupFunction, SeidrError } from "../types.js";
import { defineGetProp, defineValueProp } from "../util/define-prop.js";
import { isServer } from "../util/environment/is-server.js";
import { DATA_KEY_PARENT_OBSERVABLE_STACK, DATA_KEY_STATE, TYPE_VALUE } from "./constants.js";
import { nextUniqueId } from "./next-unique-id.js";
import { registerValueForSSR } from "./register-value-for-ssr.js";
import { isObservable } from "./type-guards.js";
import type {
  DerivedValue,
  DerivedValueOptions,
  Observable,
  Value,
  ValueChangeHandler,
  ValueOptions,
} from "./types.js";

const getParentObservableStack = () => getAppState().getData<Set<Observable>[]>(DATA_KEY_PARENT_OBSERVABLE_STACK, []);

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
  const { id = nextUniqueId(), isEqual: eq = Object.is, parents: p = [], hydrate = true } = options;

  // Register in AppState if available
  let appState!: AppState;
  let states!: Map<string, Value>;

  try {
    appState = getAppState();
    states = appState.getData<Map<string, Value>>(DATA_KEY_STATE) ?? new Map<string, Value>();

    // Check for existing Value instance with same ID when an ID is explicitly specified
    if (options.id && states.has(id)) {
      return states.get(id) as Value<T>;
    }
  } catch {
    if (isServer()) {
      if (process.env.VITEST) {
        console.warn(
          `[seidr:error] Value created with ID "${id}" but no AppState found. You should not create Values outside of the component tree in SSR, due to cross-request contamination.`,
        );
      } else {
        throw new SeidrError("Cannot create value outside of the component tree in SSR");
      }
    }
  }

  const handlers = new Set<ValueChangeHandler<T>>();
  const handlerCleanups = new Map<ValueChangeHandler<T>, CleanupFunction>();
  const cleanups = new Set<CleanupFunction>();
  const isDerived = p.length > 0;
  const parents = p.slice();

  let currentValue = initialValue as T;

  const runHandler = (listener: ValueChangeHandler<T>, value: T, prevValue: T) => {
    const cleanup = handlerCleanups.get(listener);
    if (isFn(cleanup)) {
      handlerCleanups.delete(listener);
      try {
        cleanup();
      } catch (err) {
        if (process.env.NODE_ENV !== "production") {
          console.error(err);
        }
      }
    }
    const newCleanup = listener(value, prevValue);
    if (isFn(newCleanup)) {
      handlerCleanups.set(listener, newCleanup);
    }
  };

  // Access to arguments requires a standard function
  function valueGetSetter(newValue?: T | ((prevValue: T) => T)): T {
    if (!arguments.length) {
      const stack = getParentObservableStack();
      if (stack.length) {
        stack.at(-1)!.add(valueGetSetter as Value);
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
    handlers.forEach((listener) => runHandler(listener, currentValue, prevValue));
    return prevValue;
  }

  const fn = defineValueProp(valueGetSetter as Value<T>, TYPE_PROP, TYPE_VALUE, false);

  defineValueProp(fn, "id", id, false);

  defineValueProp(fn, "isDerived", isDerived, false);

  if (!process.env.SEIDR_DISABLE_SSR) {
    defineValueProp(fn, "hydrate", !isDerived && hydrate, false);
  }

  const cleanupHandler = (handler: ValueChangeHandler<T>): void => {
    handlers.delete(handler);
    const cleanup = handlerCleanups.get(handler);
    if (isFn(cleanup)) {
      handlerCleanups.delete(handler);
      try {
        cleanup();
      } catch (err) {
        if (process.env.NODE_ENV !== "production") {
          console.error(err);
        }
      }
    }
  };

  defineValueProp(fn, "watch", (handler: ValueChangeHandler<T>): CleanupFunction => {
    if (!process.env.SEIDR_DISABLE_SSR) {
      registerValueForSSR?.(fn);
    }
    handlers.add(handler);
    const cleanup = () => cleanupHandler(handler);
    getComponentScope()?.onUnmounted(cleanup); // Clean up automatically when component unmounts
    return cleanup;
  });

  defineValueProp(fn, "bind", (handler: ValueChangeHandler<T>): CleanupFunction => {
    if (!process.env.SEIDR_DISABLE_SSR) {
      registerValueForSSR?.(fn);
    }

    handlers.add(handler);
    runHandler(handler, currentValue, currentValue);
    const cleanup = () => cleanupHandler(handler);
    getComponentScope()?.onUnmounted(cleanup); // Clean up automatically when component unmounts
    return cleanup;
  });

  defineValueProp(fn, "cleanup", (cleanupFn: CleanupFunction) => cleanups.add(cleanupFn));

  defineValueProp(fn, "destroy", () => {
    handlerCleanups.forEach((cleanup) => {
      try {
        cleanup();
      } catch (err) {
        if (process.env.NODE_ENV !== "production") {
          console.error(err);
        }
      }
    });
    handlerCleanups.clear();
    handlers.clear();
    cleanups.forEach((fn) => fn());
    cleanups.clear();
  });

  defineValueProp(fn, "as", <D>(transformFn: (value: T) => D, options: DerivedValueOptions = {}) =>
    mergeValues(() => transformFn(fn()), options),
  );

  defineGetProp(fn, "parents", () => parents?.slice() ?? []);

  defineGetProp(fn, "observerCount", () => handlers.size);

  // Register instance in AppState
  if (appState && states) {
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
 * @param {ValueOpDerivedValueOptionstions} [options={}] - The initial value (default: `{}`)
 * @returns {Value<T>} A callable function object that can be used to get or set the value and watch for changes
 */
export function mergeValues<T>(mergeFn: () => T, options: DerivedValueOptions = {}): DerivedValue<T> {
  const parentsStack = getParentObservableStack();
  parentsStack.push(new Set((options.parents ?? []).filter(isObservable)));
  try {
    const initialValue = mergeFn();
    const parents = Array.from(parentsStack.at(-1)!);
    if (parentsStack.length === 0) {
      throw new SeidrError("Derived Value must have at least one parent");
    }
    const derived = createValue<T>(initialValue, { ...options, parents: parents });
    parents.forEach((parent) => derived.cleanup(parent.watch(() => derived(mergeFn()) as void)));
    return derived as DerivedValue<T>;
  } finally {
    parentsStack.pop();
  }
}
