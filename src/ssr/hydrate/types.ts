import type { Seidr } from "../../seidr/seidr";
import type { ServerElement } from "../dom/types";
import type { SSRScopeCapture } from "../ssr-scope/types";

/**
 * Complete hydration data for client-side restoration.
 *
 * This structure contains everything needed to restore reactive state
 * on the client, essentially just the root observable values.
 */
export interface HydrationData extends SSRScopeCapture {
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

  /** Serialized app data */
  data?: Record<string, any>;

  /**
   * Root container for path traversal relative lookup (client-side only).
   */
  root?: Element | ServerElement;
}

/**
 * Storage for hydration data and Seidr instances.
 */
export interface HydrationDataStorage {
  /**
   * Hydration data containing serialized app state and component structure.
   */
  data: HydrationData | undefined;

  /**
   * Set of Seidr instances that have been hydrated.
   */
  registry: Set<Seidr>;
}
