import { isRef } from "../observable/type-guards.js";
import { type Ref, useRef } from "./use-ref.js";

/**
 * Composes multiple Refs into a single composite Ref.
 * When the composite Ref's value is set, all constituent valid Refs are updated with that value.
 *
 * @template T - The element/value type being referenced.
 * @param {...(Ref<T> | null | undefined)[]} refs - Refs to compose together.
 * @returns {Ref<T>} A new composite Ref.
 */
export function composeRefs<T = any>(...refs: (Ref<T> | null | undefined)[]): Ref<T> {
  const validRefs = refs.filter(isRef);

  // If there is an initial non-null value among the refs, initialize with it
  const initialValue = validRefs.find((r) => r() !== null)?.() ?? null;
  const composite = useRef<T>(initialValue);

  // Propagate updates on the composite ref to all constituent refs
  composite.bind((newValue) => validRefs.forEach((r) => r(newValue)));

  return composite;
}
