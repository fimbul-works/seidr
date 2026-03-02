import { createRenderFeature, getRenderFeature, type RenderFeature } from "../../render-context/feature";
import { SSRScope } from "./ssr-scope";
import type { SSRScopeCapture } from "./types";

export const SSR_SCOPE_FEATURE_ID = "seidr.ssr-scope";

/**
 * SSR scopes indexed by render context ID.
 * This ensures concurrent SSR requests have isolated scopes.
 */
export const scopes = new Map<number, SSRScope>();

/**
 * Lazily creates and returns the SSR scope feature.
 * @returns The SSR scope feature.
 */
export const getSSRScopeFeature = (): RenderFeature<SSRScope, SSRScopeCapture> =>
  getRenderFeature<SSRScope, SSRScopeCapture>(SSR_SCOPE_FEATURE_ID) ??
  createRenderFeature<SSRScope, SSRScopeCapture>({
    id: SSR_SCOPE_FEATURE_ID,
    defaultValue: () => new SSRScope(),
    serialize: (scope) => {
      return scope.captureHydrationData();
    },
    // SSRScope is not serializable
  });
