import type { Seidr } from "../seidr";
import { SeidrError } from "../types";
import { isClient } from "../util/environment/client";
import { isServer } from "../util/environment/server";
import { registerHydratingSeidr } from "./hydrate/register-hydrating-seidr";
import { getSSRScope } from "./ssr-scope";

/**
 * Registers a Seidr instance for SSR/hydration.
 *
 * @param {Seidr} seidr - The Seidr instance to register
 * @throws {SeidrError} If the Seidr ID is not unique
 */
export const registerSeidrForSSR = (seidr: Seidr): void => {
  if (process.env.CORE_DISABLE_SSR) {
    return;
  }

  // Registr parents first
  for (const parent of seidr.parents) {
    if (parent.id === seidr.id) {
      // In SSR we throw, but in the browser we just warn and return
      if (isServer()) {
        throw new SeidrError(`Seidr ID must be unique`, { cause: seidr });
      }
      console.warn(`Seidr ID must be unique`);
    }
    registerSeidrForSSR(parent);
  }

  // Don't register if hydrate is false
  if (seidr.isDerived || seidr.options.hydrate === false) {
    return;
  }

  if (isClient()) {
    // Client-side: register immediately for hydration
    registerHydratingSeidr(seidr);
  } else if (isServer()) {
    // Server-side: register with active SSR scope
    getSSRScope()?.register(seidr);
  }
};
