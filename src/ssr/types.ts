import type { AppStateData } from "../app-state/types.js";
import type { StructureMapTuple } from "./structure/types.js";

/**
 * Result of SSR rendering containing HTML and hydration data.
 */
export interface SSRRenderResult {
  /** Rendered HTML output */
  html: string;

  /** Hydration data payload */
  hydrationData: HydrationData;
}

/**
 * Hydration data for client-side restoration.
 * Contains serializable state captured during the SSR render pass.
 */
export interface HydrationData {
  /**
   * Render context ID from the server.
   */
  ctxID: number;

  /**
   * AppState data for hydration.
   */
  data: AppStateData;

  /**
   * Component ID mapping for hydration.
   */
  components?: Record<string, StructureMapTuple[]>;
}
