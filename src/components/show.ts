import type { SeidrChild } from "../element/types.js";
import type { Value } from "../observable/value.js";

/**
 * Conditionally renders content based on a reactive condition Value.
 *
 * @param {Value<any>} condition - Reactive condition observable
 * @param {() => SeidrChild} whenTrue - Factory called when condition is truthy
 * @param {() => SeidrChild} [whenFalse] - Optional fallback factory called when condition is falsy
 * @returns {Value<SeidrChild>} A derived reactive Value returning the active branch
 */
export const Show = (
  condition: Value<any>,
  whenTrue: () => SeidrChild,
  whenFalse?: () => SeidrChild,
): Value<SeidrChild> => condition.as((val) => (val ? whenTrue() : whenFalse ? whenFalse() : null));
