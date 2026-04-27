import type { Seidr } from "../seidr/seidr.js";
import { isServer } from "../util/environment/is-server.js";
import { hydrateSeidrState } from "./hydrate/hydrate-seidr-state.js";

/**
 * Registers a Seidr instance for SSR/hydration.
 *
 * @param {Seidr} seidr - The Seidr instance to register
 * @throws {SeidrError} If the Seidr ID is not unique
 */
export const registerSeidrForSSR = (seidr: Seidr): void => {
  if (process.env.SEIDR_DISABLE_SSR || isServer()) {
    return;
  }

  // Registr parents first
  for (const parent of seidr.parents) {
    registerSeidrForSSR(parent);
  }

  // Don't register derived Seidr and those that are not set to hydrate
  if (seidr.isDerived || seidr.options.hydrate === false) {
    return;
  }

  // Client-side: hydrate state immediately
  hydrateSeidrState(seidr);
};
