import { isStr, isUndef } from "@fimbul-works/hvat";
import {
  createValue,
  type DerivedValue,
  inClient,
  isValue,
  mergeValues,
  onUnmounted,
  type ReactiveValue,
} from "@fimbul-works/seidr";
import type { ImageLoadingStatus } from "./types.js";

export interface UseImageOptions {
  /**
   * The image URL to load.
   */
  src?: ReactiveValue<string | undefined | null>;

  /**
   * The delay (in ms) before displaying the image fallback.
   */
  fallbackDelay?: number;

  /**
   * CORS settings attribute for image preloading.
   */
  crossOrigin?: "anonymous" | "use-credentials" | "";

  /**
   * Referrer policy attribute for image preloading.
   */
  referrerPolicy?: ReferrerPolicy;

  /**
   * A callback providing information about the loading status of the image.
   */
  onLoadingStatusChange?: (status: ImageLoadingStatus) => void;
}

export interface UseImageResult {
  /**
   * The reactive loading status of the image.
   */
  status: DerivedValue<ImageLoadingStatus>;

  /**
   * Whether the image has finished loading successfully.
   */
  isLoaded: DerivedValue<boolean>;

  /**
   * Whether loading the image resulted in an error (or src was empty).
   */
  isError: DerivedValue<boolean>;

  /**
   * Whether the fallback should be rendered (status !== "loaded" and delay has passed).
   */
  canRenderFallback: DerivedValue<boolean>;
}

/**
 * Headless hook providing reactive state management and image preloading.
 */
export function useImage({
  src,
  fallbackDelay,
  crossOrigin,
  referrerPolicy,
  onLoadingStatusChange,
}: UseImageOptions = {}): UseImageResult {
  const status = createValue<ImageLoadingStatus>("idle");
  const delayPassed = createValue(isUndef(fallbackDelay) || fallbackDelay <= 0);

  const setStatus = (next: ImageLoadingStatus) => {
    status(next);
    onLoadingStatusChange?.(next);
  };

  inClient(() => {
    // Manage fallback delay timer in the client
    if (!isUndef(fallbackDelay) && fallbackDelay > 0) {
      const timer = window.setTimeout(() => {
        delayPassed(true);
      }, fallbackDelay);

      onUnmounted(() => {
        window.clearTimeout(timer);
      });
    }

    // Browser image loading lifecycle
    let active = true;

    const resolveUrl = (v: unknown): string | undefined => (isStr(v) && v.trim().length > 0 ? v : undefined);

    const loadImage = (rawUrl: unknown) => {
      const url = resolveUrl(rawUrl);
      if (!url) {
        setStatus("error");
        return;
      }

      setStatus("loading");

      const image = new window.Image();
      if (!isUndef(crossOrigin)) image.crossOrigin = crossOrigin;
      if (!isUndef(referrerPolicy)) image.referrerPolicy = referrerPolicy;

      image.onload = () => {
        if (active) setStatus("loaded");
      };

      image.onerror = () => {
        if (active) setStatus("error");
      };

      image.src = url;
    };

    if (isValue(src)) {
      if (!isUndef(src())) {
        loadImage(src());
      }
      const unwatch = src.watch((next) => {
        if (active) loadImage(next);
      });
      onUnmounted(() => {
        active = false;
        unwatch();
      });
    } else if (!isUndef(src)) {
      loadImage(src);
      onUnmounted(() => {
        active = false;
      });
    }
  });

  const canRenderFallback = mergeValues(() => delayPassed() && status() !== "loaded", {
    parents: [delayPassed, status],
  });

  return {
    status: status.as((s) => s),
    isLoaded: status.as((s) => s === "loaded"),
    isError: status.as((s) => s === "error"),
    canRenderFallback,
  };
}
