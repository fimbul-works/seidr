import { isValue } from "../observable/type-guards.js";
import type { Value } from "../observable/types.js";
import { isServer } from "../util/environment/is-server.js";
import { hydrateValueState } from "./hydrate/hydrate-value-state.js";

/**
 * Registers a Value instance for SSR/hydration.
 *
 * @param {Value} value - The Value instance to register
 */
export const registerValueForSSR = (value: Value): void => {
  if (process.env.SEIDR_DISABLE_SSR || isServer() || !isValue(value)) {
    return;
  }

  // Registr parents
  if (value.parents) {
    for (const parent of value.parents) {
      registerValueForSSR(parent as Value);
    }
  }

  // Don't register derived values or values that are not set to hydrate
  if (value.isDerived || value.hydrate === false) {
    return;
  }

  // Client-side: hydrate state immediately
  hydrateValueState(value);
};
