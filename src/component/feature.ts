import { createRenderFeature, getRenderFeature, type RenderFeature } from "../render-context/feature";

/**
 * Data key for SSR onPromise callback.
 */
export const ON_PROMISE_DATA_KEY = "seidr.ssr.onPromise";

/**
 * @deprecated Use ON_PROMISE_DATA_KEY with AppState instead.
 * Lazily creates and returns the on promise feature.
 * @returns The on promise feature.
 */
export const getOnPromiseFeature = (): RenderFeature<((p: Promise<any>) => void) | undefined> =>
  getRenderFeature<((p: Promise<any>) => void) | undefined>(ON_PROMISE_DATA_KEY) ??
  createRenderFeature<((p: Promise<any>) => void) | undefined>({
    id: ON_PROMISE_DATA_KEY,
  });
