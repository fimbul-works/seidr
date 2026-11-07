import { createValue, mergeValues, useId, wrapValue } from "@fimbul-works/seidr";
import { toastStore } from "./toast-store.js";
import { TOAST_HOTKEY_PLACEHOLDER, TOAST_REGION_INTL_TRANSLATIONS } from "./toast.intl.js";
import type { ToastSwipeDirection, UseToastRegionOptions, UseToastRegionResult } from "./types.js";

/**
 * Headless state and logic coordinator for a ToastRegion.
 */
export function useToastRegion(options: UseToastRegionOptions = {}): UseToastRegionResult {
  const {
    id: customId,
    translations = TOAST_REGION_INTL_TRANSLATIONS,
    ariaLabel: rawAriaLabel,
    hotkey = ["altKey", "KeyT"],
    duration: rawDuration = 5000,
    limit: rawLimit = 3,
    swipeDirection: rawSwipeDirection = "right",
    swipeThreshold: rawSwipeThreshold = 50,
    pauseOnInteraction: rawPauseOnInteraction = true,
    pauseOnPageIdle: rawPauseOnPageIdle = true,
    topLayer: rawTopLayer = true,
    regionId,
    dataComponent = "toast",
  } = options;

  const id = customId ?? useId(`${dataComponent}-region`);
  const isPausedState = createValue(false, { hydrate: false });
  const isPaused = isPausedState.as((v) => v);

  const duration = wrapValue(rawDuration).as((d) => Number(d));
  const limit = wrapValue(rawLimit).as((l) => Number(l));
  const swipeDirection = wrapValue(rawSwipeDirection).as((d): ToastSwipeDirection => d);
  const swipeThreshold = wrapValue(rawSwipeThreshold).as((t) => Number(t));
  const pauseOnInteraction = wrapValue(rawPauseOnInteraction).as((p) => Boolean(p));
  const pauseOnPageIdle = wrapValue(rawPauseOnPageIdle).as((p) => Boolean(p));
  const topLayer = wrapValue(rawTopLayer).as((t) => Boolean(t));

  const toasts = mergeValues(
    () =>
      toastStore
        .toasts()
        .filter((toast) => toast.region === regionId && !toast.dismiss)
        .slice(0, limit()),
    { parents: [toastStore.toasts, limit] },
  );

  const hasToasts = toasts.as((list) => list.length > 0);

  const hotkeyLabel = hotkey.join("+").replace(/Key/g, "").replace(/Digit/g, "");

  const ariaLabelSource = wrapValue(rawAriaLabel);
  const ariaLabel = ariaLabelSource.as((customLabel) => {
    const template = customLabel || translations.notifications(TOAST_HOTKEY_PLACEHOLDER);
    return template.replace(TOAST_HOTKEY_PLACEHOLDER, hotkeyLabel);
  });

  const pauseAllTimer = () => {
    isPausedState(true);
  };

  const resumeAllTimer = () => {
    isPausedState(false);
  };

  const generateId = (part: string) => `${id}-${part}`;

  return {
    id,
    regionId,
    dataComponent,
    isPaused,
    toasts,
    hasToasts,
    hotkey,
    ariaLabel,
    duration,
    swipeDirection,
    swipeThreshold,
    pauseOnInteraction,
    pauseOnPageIdle,
    topLayer,
    pauseAllTimer,
    resumeAllTimer,
    generateId,
  };
}

