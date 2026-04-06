import type { HydrationData } from "./hydrate/types.js";

/**
 * Result of SSR rendering containing HTML and hydration data.
 */
export interface SSRRenderResult {
  html: string;
  hydrationData: HydrationData;
}
