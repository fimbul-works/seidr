import { isFn } from "@fimbul-works/hvat";
import { onUnmounted, type Value, wrapValue } from "@fimbul-works/seidr";

export interface UseControllableValueProps<T> {
  /** The value to be used, in controlled mode. */
  value?: T | Value<T>;

  /** The default value to be used, in uncontrolled mode. */
  defaultValue?: T;

  /** A function that will be called when the value changes. */
  onChange?: (value: T) => void;
}

/**
 * Manages controlled vs uncontrolled state with `onChange` notification,
 *
 * Calling `val()` reads the current value.
 * Calling `val(next)` or `val((prev) => next)` updates it and invokes `onChange`.
 */
export function useControllableValue<T>(props: UseControllableValueProps<T>): Value<T> {
  const state = wrapValue<T>((props.value ?? props.defaultValue) as T | Value<T>, {
    hydrate: false,
  });

  if (isFn(props.onChange)) {
    state.watch((val) => props.onChange?.(val));
  }

  return state;
}

/**
 * Controllable boolean value with fallback of `false`.
 */
export function useControllableBooleanValue(props: UseControllableValueProps<boolean>): Value<boolean> {
  return useControllableValue<boolean>({
    ...props,
    defaultValue: props.defaultValue ?? false,
  });
}

/**
 * Controllable array value with fallback of `[]`.
 */
export function useControllableArrayValue<T>(props: UseControllableValueProps<T[]>): Value<T[]> {
  return useControllableValue<T[]>({
    ...props,
    defaultValue: props.defaultValue ?? [],
  });
}

/**
 * Controllable Set value with fallback of `new Set()`.
 */
export function useControllableSetValue<T>(props: UseControllableValueProps<Set<T>>): Value<Set<T>> {
  return useControllableValue<Set<T>>({
    ...props,
    defaultValue: props.defaultValue ?? new Set<T>(),
  });
}
