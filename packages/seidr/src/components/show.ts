import { getComponentScope, setComponentScope } from "../component/component-scope.js";
import type { SeidrComponentFactory, SeidrComponentFactoryOrFunction } from "../component/types.js";
import { wrapComponent } from "../component/wrap-component.js";
import type { SeidrChild } from "../element/types.js";
import type { Value } from "../observable/value.js";

/**
 * Conditionally renders content based on a reactive condition Value.
 *
 * @param {Value<any>} condition - Reactive condition observable
 * @param {SeidrComponentFactoryOrFunction} whenTrue - Factory called when condition is truthy
 * @param {SeidrComponentFactoryOrFunction} [whenFalse] - Optional fallback factory called when condition is falsy
 * @param {string} [name="Show"] - Optional name for debugging (default: "Show")
 * @returns {Value<SeidrChild>} A derived reactive Value returning the active branch
 */
export const Show = (
  condition: Value<any>,
  whenTrue: SeidrComponentFactoryOrFunction,
  whenFalse?: SeidrComponentFactoryOrFunction,
  name: string = "Show",
): Value<SeidrChild> => {
  const scope = getComponentScope();
  const trueFactory = wrapComponent(whenTrue, name);
  const falseFactory = whenFalse ? wrapComponent(whenFalse, `${name}Fallback`) : undefined;

  const renderBranch = (factory?: SeidrComponentFactory): SeidrChild => {
    if (!factory) return null;
    const prevScope = getComponentScope();
    if (scope) {
      setComponentScope(scope);
    }

    try {
      return factory();
    } finally {
      setComponentScope(prevScope);
    }
  };

  return condition.as((val) => (val ? renderBranch(trueFactory) : renderBranch(falseFactory)));
};
