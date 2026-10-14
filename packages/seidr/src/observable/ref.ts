import { TYPE_PROP } from "../constants.js";
import { SeidrError } from "../types.js";
import { defineValueProp } from "../util/define-prop.js";
import { TYPE_REF } from "./constants.js";
import { isRef } from "./type-guards.js";
import type { Ref } from "./types.js";
import { createValue } from "./value.js";

/**
 * Creates a Ref handle.
 *
 * Ref is a convenience wrapper for a non-hydrated Value that holds a reference to a DOM element, object, array, or primitive.
 *
 * @template T - Type of value to reference.
 * @param {T | null} [initialValue=null] - Optional initial value.
 * @returns {Ref<T>} Ref handle.
 */
export function createRef<T = any, R = T extends undefined | null ? never : Ref<T>>(initialValue: T | null = null): R {
  const value = createValue<T | null>(initialValue, { hydrate: false });

  // Access to arguments requires a standard function
  function fn(newValue?: T | null): T | null {
    if (!arguments.length) {
      return value();
    }
    if (newValue !== undefined) {
      value(newValue);
      return newValue;
    } else {
      throw new SeidrError("Invalid value for Ref");
    }
  }

  // Attach the value property to the function
  const ref = defineValueProp(fn as Ref<T>, TYPE_PROP, TYPE_REF, false);

  // Copy Value properties to Ref handle
  (["watch", "bind", "destroy"] as (keyof Ref)[]).forEach((prop) => {
    defineValueProp(ref, prop, value[prop]);
  });

  return ref as R;
}

/**
 * Composes multiple Refs into a single composite Ref handle.
 *
 * When the composite Ref's value is set, all constituent valid Refs are updated with that value.
 *
 * @template T - The element/value type being referenced.
 * @param {...(Ref<T> | null | undefined)[]} refs - Refs to compose together.
 * @returns {Ref<T>} A new composite Ref handle.
 */
export function composeRefs<T = any>(...refs: (Ref<T> | null | undefined)[]): Ref<T> {
  const validRefs = refs.filter(isRef);

  // If there is an initial non-null value among the refs, initialize with it
  const initialValue = validRefs.find((r) => r() !== null)?.() ?? null;
  const composite = createRef<T>(initialValue);

  // Propagate updates on the composite ref to all constituent refs
  composite.bind((newValue) => validRefs.forEach((r) => r(newValue)));

  return composite;
}
