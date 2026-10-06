import { getComponentScope, setComponentScope } from "../component/component-scope.js";
import { wrapComponent } from "../component/wrap-component.js";
import type { SeidrChild } from "../element/types.js";
import type { SeidrComponentFactoryOrFunction } from "../index.core.js";
import { isValue } from "../observable/type-guards.js";
import type { Value } from "../observable/value.js";
import { mergeValues } from "../observable/value.js";

/**
 * Type of branch map or record for Switch.
 */
export type SwitchBranches<K extends string | number> =
  | Record<K, SeidrComponentFactoryOrFunction>
  | ReadonlyMap<K, SeidrComponentFactoryOrFunction>;

/**
 * Switches between different component/element branches based on a reactive key Value.
 *
 * @template {string | number} K - The key type
 * @template {SwitchBranches<K>} B - The branches type
 * @param {Value<K>} value - Reactive value to switch on
 * @param {B | Value<B>} branches - Map or Record of case factories (or reactive Value of branches)
 * @param {SeidrComponentFactoryOrFunction} [fallback] - Optional fallback factory function
 * @param {string} [name="Switch"] - Optional name for debugging (default: "Switch")
 * @returns {Value<SeidrChild>} A derived Value returning the matched branch
 */
export const Switch = <K extends string | number, B extends SwitchBranches<K> = SwitchBranches<K>>(
  value: Value<K>,
  branches: B | Value<B>,
  fallback?: SeidrComponentFactoryOrFunction,
  name: string = "Switch",
): Value<SeidrChild> => {
  const scope = getComponentScope();

  const getBranch = (key: K, currentBranches: B): SeidrChild => {
    const rawFactory =
      currentBranches instanceof Map
        ? currentBranches.get(key)
        : (currentBranches as Record<K, SeidrComponentFactoryOrFunction>)[key];

    const factory = rawFactory ? wrapComponent(rawFactory, `${name}_${String(key)}`) : undefined;
    const fallbackComp = fallback ? wrapComponent(fallback, `${name}Fallback`) : undefined;

    const prevScope = getComponentScope();
    if (scope) {
      setComponentScope(scope);
    }

    try {
      return factory ? factory(undefined, key) : fallbackComp ? fallbackComp() : null;
    } finally {
      setComponentScope(prevScope);
    }
  };

  if (isValue<B>(branches)) {
    return mergeValues(() => getBranch(value(), branches()));
  }

  return value.as((key) => getBranch(key, branches));
};
