import type { ObservableOptions } from "./types";

/**
 * Options to opt-out of hydration for Seidr instances.
 */
export const noHydrate: ObservableOptions = process.env.CORE_DISABLE_SSR
  ? ({} as const)
  : ({ hydrate: false } as const);
