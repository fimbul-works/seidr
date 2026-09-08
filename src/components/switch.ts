import { getComponentScope, setComponentScope } from "../component/lifecycle/component-scope.js";
import type { SeidrChild } from "../element/types.js";
import { isValue } from "../observable/type-guards.js";
import type { Value } from "../observable/value.js";
import { mergeValues } from "../observable/value.js";

/**
 * Type of branch map or record for Switch.
 */
export type SwitchBranches<K extends string | number> = Record<K, () => SeidrChild> | ReadonlyMap<K, () => SeidrChild>;

/**
 * Switches between different component/element branches based on a reactive key Value.
 *
 * @template {string | number} K - The key type
 * @template {SwitchBranches<K>} B - The branches type
 * @param {Value<K>} value - Reactive value to switch on
 * @param {B | Value<B>} branches - Map or Record of case factories (or reactive Value of branches)
 * @param {() => SeidrChild} [fallback] - Optional fallback factory function
 * @returns {Value<SeidrChild>} A derived Value returning the matched branch
 */
export const Switch = <K extends string | number, B extends SwitchBranches<K> = SwitchBranches<K>>(
  value: Value<K>,
  branches: B | Value<B>,
  fallback?: () => SeidrChild,
): Value<SeidrChild> => {
  const scope = getComponentScope();

  const getBranch = (key: K, currentBranches: B): SeidrChild => {
    const factory =
      currentBranches instanceof Map ? currentBranches.get(key) : (currentBranches as Record<K, () => SeidrChild>)[key];

    const prevScope = getComponentScope();
    if (scope) {
      setComponentScope(scope);
    }
    try {
      return factory ? (factory as any)(undefined, key) : fallback ? fallback() : null;
    } finally {
      setComponentScope(prevScope);
    }
  };

  if (isValue<B>(branches)) {
    return mergeValues(() => getBranch(value(), branches()));
  }

  return value.as((key) => getBranch(key, branches));
};
