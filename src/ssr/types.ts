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
   * Numeric ID -> value mapping for root observables.
   *
   * Only contains root observables (isDerived = false).
   * Derived observables are recreated on the client and don't need their values stored.
   */
  observables: Record<number, any>;
}

/**
 * Complete hydration data for client-side restoration.
 *
 * This structure contains everything needed to restore reactive state
 * on the client, essentially just the root observable values.
 */
export interface HydrationData extends SSRScopeCapture {
  /**
   * State values from the server.
   *
   * This record contains all non-derived Seidr instances that were stored
   * in the state system during SSR. The keys are the string names from
   * the state symbols, and the values are the Seidr values.
   *
   * During hydration, these values are restored to the state storage
   * for the render context, so that getState() calls return the same
   * values that were used on the server.
   */
  state?: Record<string, unknown>;

  /**
   * Render context ID from the server.
   *
   * This ID is used to ensure deterministic marker IDs for components like Router,
   * allowing the client-side hydration to match SSR-rendered markers.
   *
   * During hydration, the client-side render context is updated to use this ID
   * instead of the default 0, enabling proper SSR/client marker matching.
   */
  ctxID?: number;
}
