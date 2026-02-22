import { createRenderFeature, getRenderFeature, type RenderFeature } from "../../render-context/feature";
import type { HydrationCursor } from "./cursor";

const HYDRATION_CURSOR_FEATURE_ID = "seidr.hydration.cursor";

/**
 * Lazily creates and returns the hydration cursor feature.
 * @returns The hydration cursor feature.
 */
export const getHydrationCursorFeature = (): RenderFeature<HydrationCursor | null> =>
  getRenderFeature<HydrationCursor | null>(HYDRATION_CURSOR_FEATURE_ID) ??
  createRenderFeature<HydrationCursor | null>({
    id: HYDRATION_CURSOR_FEATURE_ID,
    defaultValue: () => null,
  });
