import type { StructureMapTuple } from "../structure/structure-map";

/**
 * Internal hydration data captured by SSRScope.
 * This is combined with ctxID to form the complete HydrationData.
 */
export interface SSRScopeCapture {
  /**
   * Seidr ID -> value mapping for root observables.
   * Only contains root observables (isDerived = false).
   */
  observables: Record<string, any>;

  /**
   * Component ID -> Structure Map mapping.
   */
  components: Record<string, StructureMapTuple[]>;
}
