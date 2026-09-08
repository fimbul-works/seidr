import type { Value } from "../observable/value.js";
import { isServer } from "../util/environment/is-server.js";
import { hydrateValueState } from "./hydrate/hydrate-value-state.js";

/**
 * Registers a Value instance for SSR/hydration.
 *
 * @param {Value} value - The Value instance to register
 */
export const registerValueForSSR = (value: Value): void => {
  if (process.env.SEIDR_DISABLE_SSR || isServer()) {
    return;
  }

  // Registr parents first
  for (const parent of value.parents) {
    registerValueForSSR(parent);
  }

  // Don't register derived values or values that are not set to hydrate
  if (value.isDerived || value.hydrate === false) {
    return;
  }

  // Client-side: hydrate state immediately
  hydrateValueState(value);
};
