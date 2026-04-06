import type { Seidr } from "../seidr";
import { SeidrError } from "../types";
import { isClient } from "../util/environment/client";
import { isServer } from "../util/environment/is-server";
import { registerHydratingSeidr } from "./hydrate/register-hydrating-seidr";
import { getSSRScope } from "./ssr-scope";

/**
 * Registers a Seidr instance for SSR/hydration.
 *
 * @param {Seidr} seidr - The Seidr instance to register
 * @throws {SeidrError} If the Seidr ID is not unique
 */
export const registerSeidrForSSR = (seidr: Seidr): void => {
  if (process.env.DISABLE_SSR) {
    return;
  }

  // Registr parents first
  for (const parent of seidr.parents) {
    registerSeidrForSSR(parent);
  }

  // Don't register if hydrate is false
  if (seidr.isDerived || seidr.options.hydrate === false) {
    return;
  }

  if (isServer()) {
    // Server-side: register with active SSR scope
    getSSRScope()?.register(seidr);
  } else if (!process.env.DISABLE_SSR && isClient()) {
    // Client-side: register immediately for hydration
    registerHydratingSeidr(seidr);
  }
};
