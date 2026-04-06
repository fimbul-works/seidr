import type { ObservableOptions } from "./types.js";

/**
 * Options to opt-out of hydration for Seidr instances.
 */
export const noHydrate: ObservableOptions = process.env.DISABLE_SSR ? ({} as const) : ({ hydrate: false } as const);

/** Captured state data key in AppState */
export const DATA_KEY_STATE = "state";
