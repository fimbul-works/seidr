import { getRenderContext } from "./render-context";
import type { RenderContext, RenderFeature, RenderFeatureOptions } from "./types";

export type { RenderFeature, RenderFeatureOptions } from "./types";

// Global registry to keep track of all created features (useful for SSR loops)
export const featuresRegistry = new Map<string, RenderFeature<any, any>>();

/**
 * Gets a registered feature.
 *
 * @param id The ID of the feature to get.
 * @returns The feature if it exists, undefined otherwise.
 */
export const getRenderFeature = <T, S = T>(id: string): RenderFeature<T, S> | undefined =>
  featuresRegistry.get(id) as RenderFeature<T, S> | undefined;

/**
 * Creates and registers a new render feature.
 *
 * @param feature Feature options including ID, default value factory, and optional serialization hooks.
 * @returns The strongly typed RenderFeature token.
 */
export const createRenderFeature = <T, S = T>(feature: RenderFeatureOptions<T, S>): RenderFeature<T, S> => {
  featuresRegistry.set(feature.id, feature);
  return feature;
};

/**
 * Gets the feature state from the current render context (or the provided one).
 * Initializes the state if it doesn't exist yet.
 *
 * @param feature The RenderFeature token.
 * @param ctx Optional RenderContext. Defaults to the current active context.
 * @returns The feature state.
 */
export const getFeature = <T>(feature: RenderFeature<T, any>, ctx: RenderContext = getRenderContext()): T => {
  if (!ctx.featureData.has(feature.id)) {
    ctx.featureData.set(feature.id, feature.defaultValue?.());
  }
  return ctx.featureData.get(feature.id) as T;
};

/**
 * Sets the feature state in the current render context (or the provided one).
 *
 * @param feature The RenderFeature token.
 * @param value The new state for the feature.
 * @param ctx Optional RenderContext. Defaults to the current active context.
 */
export const setFeature = <T>(
  feature: RenderFeature<T, any>,
  value: T,
  ctx: RenderContext = getRenderContext(),
): void => {
  ctx.featureData.set(feature.id, value);
};

/**
 * Serializes all registered features that provide a `serialize` method, extracting their data
 * from the provided RenderContext.
 *
 * @param ctx The RenderContext to serialize.
 * @returns A dictionary of serialized feature data.
 */
export const serializeFeatures = (ctx: RenderContext): Record<string, any> => {
  const result: Record<string, any> = {};
  if (!ctx.featureData) {
    return result;
  }

  for (const feature of featuresRegistry.values()) {
    if (feature.serialize && ctx.featureData.has(feature.id)) {
      const value = ctx.featureData.get(feature.id);
      result[feature.id] = feature.serialize(value);
    }
  }

  return result;
};

/**
 * Deserializes feature data into the provided RenderContext.
 *
 * @param ctx The RenderContext to populate.
 * @param serializedData A dictionary of serialized feature data.
 */
export const deserializeFeatures = (ctx: RenderContext, serializedData: Record<string, any> | undefined): void => {
  if (!serializedData) {
    return;
  }

  for (const [id, value] of Object.entries(serializedData)) {
    const feature = featuresRegistry.get(id);
    if (feature?.deserialize) {
      ctx.featureData.set(feature.id, feature.deserialize(value));
    } else if (feature) {
      // If no deserialize function is provided, we just assume the value is ready to use directly
      ctx.featureData.set(feature.id, value);
    }
  }
};
