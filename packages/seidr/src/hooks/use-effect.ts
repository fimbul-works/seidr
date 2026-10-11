import { getComponentScope } from "../component/component-scope.js";
import { isRef, isValue } from "../observable/type-guards.js";
import { mergeValues, type Value } from "../observable/value.js";
import { type CleanupFunction, SeidrError } from "../types.js";
import { inClient } from "../util/environment/in-client.js";
import { isArray, isFn } from "../util/type-guards.js";
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

  const component = getComponentScope();
  if (!component) {
    throw new SeidrError("useEffect called outside of component");
  }

  let unbind: CleanupFunction | undefined;
  let derived: Value<any[]> | undefined;

  component.onUnmounted(() => {
    if (unbind) {
      unbind();
      unbind = undefined;
    }
    if (derived) {
      derived.destroy();
      derived = undefined;
    }
  });

  component.onMounted(() => {
    inClient(() => {
      if (deps.length === 0) {
        const cleanup = effect();
        if (isFn(cleanup)) {
          unbind = cleanup;
        }
        return;
      }

      derived = mergeValues(() => deps.map((d) => d()), { hydrate: false });
      unbind = derived.bind(() => effect());
    });
  });
}
