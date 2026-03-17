import type { ObservableOptions } from "./types";

/**
 * Options to opt-out of hydration for Seidr instances.
 */
export const NO_HYDRATE: ObservableOptions = process.env.CORE_DISABLE_SSR ? {} : { hydrate: false };
