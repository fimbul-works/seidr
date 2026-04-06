import type { HydrationData } from "./hydrate/types.js";
import type { StructureMapTuple } from "./structure/types.js";

/**
 * Result of SSR rendering containing HTML and hydration data.
 */
export interface SSRRenderResult {
  html: string;
  hydrationData: HydrationData;
}

/**
 * Internal hydration data captured by SSRScope.
 * This is combined with ctxID to form the complete HydrationData.
 */
export interface SSRScopeCapture {
  /**
   * AppState data for hydration.
   */
  data: Record<string, any>;
  /**
   * Component ID -> Structure Map mapping.
   */
  components: Record<string, StructureMapTuple[]>;
}
