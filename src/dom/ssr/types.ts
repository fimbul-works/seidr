import type { SSRScope } from "./ssr-scope";

/**
 * Represents the captured state of observables during SSR.
 * Only contains root observable values (not derived/computed).
 */
export interface SSRState {
  observables: Record<string, any>;
}

/**
 * Result of SSR rendering containing HTML and captured state.
 */
export interface SSRRenderResult {
  html: string;
  state: SSRState;
}

/**
 * Hydration data for client-side restoration of observable state.
 */
export interface HydrationData {
  scope?: SSRScope;
  state?: SSRState;
}
