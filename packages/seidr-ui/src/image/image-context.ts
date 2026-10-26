import type { Value } from "@fimbul-works/seidr";
import { createContext } from "../utils/create-context.js";
import type { ImageLoadingStatus } from "./types.js";

export interface ImageContextValue {
  /** Delay (in ms) before showing the fallback */
  fallbackDelay?: number;
  /** Reactive status of image loading */
  status: Value<ImageLoadingStatus>;
  /** Callback fired whenever the image loading status transitions */
  onLoadingStatusChange?: (status: ImageLoadingStatus) => void;
}

export const imageContext = createContext<ImageContextValue>(
  "Image",
  "[seidr-ui]: Image components must be called within an Image.Root callback (e.g. Image.Root(props, (img) => [...])) or using a scoped image instance.",
);

/**
 * Accesses the active ImageContextValue from the context stack.
 */
export const useImageContext = (): ImageContextValue => imageContext.use();

/**
 * Accesses the active ImageContextValue if present, returning undefined otherwise.
 */
export const useOptionalImageContext = (): ImageContextValue | undefined => imageContext.get();
