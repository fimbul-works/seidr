/**
 * Interface for serializing and deserializing SSR hydration data payloads.
 */
export interface HydrationSerializer {
  /**
   * Serializes a hydration data payload into a string.
   *
   * @param data - The hydration data to serialize
   * @returns The serialized string
   */
  stringify: (data: unknown) => string;

  /**
   * Deserializes a string into a hydration data payload.
   *
   * @param text - The serialized string to parse
   * @returns The parsed hydration data
   */
  parse: (text: string) => unknown;
}

/**
 * Default hydration serializer using the native global JSON object.
 */
export const defaultHydrationSerializer: HydrationSerializer = JSON;

/**
 * The currently active hydration serializer.
 */
let activeSerializer: HydrationSerializer = defaultHydrationSerializer;

/**
 * Sets the active hydration serializer for SSR hydration data payloads.
 *
 * @param {HydrationSerializer} serializer - The serializer instance to use
 */
export function setHydrationSerializer(serializer: HydrationSerializer): void {
  activeSerializer = serializer;
}

/**
 * Returns the currently active hydration serializer.
 *
 * @returns {HydrationSerializer} The active serializer
 */
export function getHydrationSerializer(): HydrationSerializer {
  return activeSerializer;
}
