import type { StructureMapTuple } from "./structure/types.js";

/**
 * AppState data that can be passed to `renderToString`, and is included in HydrationData payload.
 */
export type AppStateData = Record<string, any>;

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
 * Complete hydration data for client-side restoration.
 *
 * This structure contains everything needed to restore reactive state
 * on the client, essentially just the root observable values.
 */
export interface HydrationData {
  /**
   * Render context ID from the server.
   *
   * This ID is used to ensure deterministic marker IDs for components like Router,
   * allowing the client-side hydration to match SSR-rendered markers.
   *
   * During hydration, the client-side render context is updated to use this ID
   * instead of the default 0, enabling proper SSR/client marker matching.
   */
  ctxID: number;

  /**
   * AppState data for hydration.
   */
  data: AppStateData;
  /**
   * Component ID -> Structure Map mapping.
   */
  components: Record<string, StructureMapTuple[]>;
}
