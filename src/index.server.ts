import { setAppStateProvider } from "./app-state/app-state";
import { getSSRAppState } from "./app-state/app-state.server";
import type { ComponentType } from "./component/types";
import { Seidr } from "./seidr/seidr";
import type { HydrationData } from "./ssr/hydrate/types";
import { registerSeidrForSSR } from "./ssr/register-seidr";
import { type CleanupFunction, SeidrError } from "./types";

export * from "./index.core";
export * from "./ssr/render-to-string";

/**
 * Server-side hydration function.
 * This is a placeholder that will throw an error if called in the server bundle, as hydration is only available in the client bundle.
 *
 * @template {ComponentType} T - The type of the component, which can be a factory or a component instance
 * @param {T} _factory - The component or factory to hydrate
 * @param {HTMLElement} _container - The HTMLElement to mount the hydrated component into
 * @param {HydrationData} _hydrationData - The previously captured hydration data
 * @returns {CleanupFunction} A cleanup function that unmounts the component when called
 */
export const hydrate = <T extends ComponentType>(
  _factory: T,
  _container: HTMLElement,
  _hydrationData: HydrationData,
): CleanupFunction => {
  throw new SeidrError("Hydrate is not available in the server bundle. Please use the client bundle for hydration.");
};

Seidr.register = registerSeidrForSSR;
setAppStateProvider(getSSRAppState);
