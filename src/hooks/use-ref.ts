import { TYPE_PROP } from "../constants.js";
import { isHTMLElement } from "../dom/type-guards.js";
import { createValue, type ValueChangeHandler } from "../observable/value.js";
import { type CleanupFunction, SeidrError } from "../types.js";
import { defineValueProp } from "../util/define-prop.js";

/** Ref type string. */
export const TYPE_REF = "ref";

/**
 * Ref object.
 */
export interface Ref<T extends Element = Element> {
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

/**
 * Creates a Ref object.
 * Ref is a convenience wrapper for a Value that holds either an Element or null.
 * @template {Element} T - Type of Element to reference.
 * @returns {Ref<T>} Ref object.
 */
export function useRef<T extends Element = Element>(): Ref<T> {
  const value = createValue<T | null>(null, { hydrate: false });

  // Access to arguments requires a standard function
  function fn(newValue?: null): T | null {
    if (!arguments.length) {
      return value();
    }
    if (isHTMLElement(newValue) || newValue === null) {
      value(newValue);
      return newValue;
    } else {
      throw new SeidrError("Invalid value for Ref");
    }
  }

  // Attach the value property to the function
  const ref = defineValueProp(fn as Ref<T>, TYPE_PROP, TYPE_REF, false);

  // Copy Value properties to Ref object
  (["watch", "bind", "destroy"] as (keyof Ref)[]).forEach((prop) => {
    defineValueProp(ref, prop, value[prop]);
  });

  return ref;
}
