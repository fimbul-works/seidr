import { createRenderFeature, getRenderFeature, type RenderFeature } from "../render-context/feature";

const PATH_FEATURE_ID = "seidr.router.path";

/**
 * Lazily creates and returns the current path feature.
 * @returns The current path feature.
 */
export const getCurrentPathFeature = (): RenderFeature<string, string> =>
  getRenderFeature<string, string>(PATH_FEATURE_ID) ??
  createRenderFeature<string, string>({
    id: PATH_FEATURE_ID,
    defaultValue: () => "/",
  });
