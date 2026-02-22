import { createRenderFeature, getRenderFeature, type RenderFeature } from "../render-context/feature";

const ON_PROMISE_FEATURE_ID = "seidr.ssr.onPromise";

/**
 * Lazily creates and returns the on promise feature.
 * @returns The on promise feature.
 */
export const getOnPromiseFeature = (): RenderFeature<((p: Promise<any>) => void) | undefined> =>
  getRenderFeature<((p: Promise<any>) => void) | undefined>(ON_PROMISE_FEATURE_ID) ??
  createRenderFeature<((p: Promise<any>) => void) | undefined>({
    id: ON_PROMISE_FEATURE_ID,
  });
