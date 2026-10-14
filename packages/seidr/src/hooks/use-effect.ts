import { isRef, isValue } from "../observable/type-guards.js";
import { mergeValues, type Value } from "../observable/value.js";
import { type CleanupFunction, SeidrError } from "../types.js";
import { isServer } from "../util/environment/is-server.js";
import { isArray, isFn } from "../util/type-guards.js";
import { onMounted } from "./on-mounted.js";
import { onUnmounted } from "./on-unmounted.js";
import type { Ref } from "./use-ref.js";

export type EffectCallback = () => CleanupFunction | void;
export type EffectDependency = Value<any> | Ref<any>;

/**
 * Registers an effect that executes when the component is mounted on the client,
 * and re-runs whenever any of the observed dependency Values or Refs change.
 *
 * @param {EffectCallback} effect - Callback function to execute. Can optionally return a cleanup function.
 * @param {EffectDependency[]} deps - Array of Value or Ref dependencies to observe.
 * @throws {SeidrError} If effect is not a function, deps is not an array, or any dependency is not a Value or Ref.
 */
export function useEffect(effect: EffectCallback, deps: EffectDependency[]): void {
  // Run only on client
  if (isServer()) return;

  // Validate in development mode
  if (process.env.NODE_ENV !== "production") {
    if (!isFn(effect)) {
      throw new SeidrError("useEffect callback must be a function");
    }

    if (!isArray(deps)) {
      throw new SeidrError("useEffect dependencies must be an array");
    }

    for (const dep of deps) {
      if (!isValue(dep) && !isRef(dep)) {
        throw new SeidrError("useEffect dependencies must be Value or Ref instances");
      }
    }
  }

  let unbind: CleanupFunction | undefined;
  let derived: Value<any[]> | undefined;

  onMounted(() => {
    if (deps.length === 0) {
      const cleanup = effect();
      if (isFn(cleanup)) {
        unbind = cleanup;
      }
      return;
    }

    derived = mergeValues(() => deps.map((d) => d()));
    unbind = derived.bind(effect);
  });

  onUnmounted(() => {
    unbind?.();
    derived?.destroy();
  });
}
