import { createValue, inClient, mergeValues, onUnmounted, useId, wrapValue } from "@fimbul-works/seidr";
import { DATA_COMPONENT_TOAST } from "../constants.js";
import { TOAST_INTL_TRANSLATIONS } from "./toast.intl.js";
import { toastStore } from "./toast-store.js";
import type { ToastPriority, ToastSwipeDirection, UseToastOptions, UseToastResult } from "./types.js";

/**
 * Headless state and logic coordinator for an individual Toast item.
 */
export function useToast(options: UseToastOptions): UseToastResult {
  const {
    id: customId,
    toastId,
    region,
    translations = TOAST_INTL_TRANSLATIONS,
    priority: rawPriority = "high",
    duration: rawDuration,
    persistent: rawPersistent = false,
    onPause,
    onResume,
    onSwipeStart,
    onSwipeMove,
    onSwipeCancel,
    onSwipeEnd,
    onEscapeKeyDown,
    dataComponent = DATA_COMPONENT_TOAST,
  } = options;

  const id = customId ?? useId(dataComponent);

  const isOpenState = createValue(true, { hydrate: false });
  const isOpen = isOpenState.as((v) => v);

  const titleIdState = createValue<string | undefined>(undefined, { hydrate: false });
  const titleId = titleIdState.as((v) => v);

  const descriptionIdState = createValue<string | undefined>(undefined, { hydrate: false });
  const descriptionId = descriptionIdState.as((v) => v);

  const initialIsUpdated = Boolean(toastStore.get(toastId)?.update);
  const isAnimationEnabledState = createValue(!initialIsUpdated, { hydrate: false });
  const isAnimationEnabled = isAnimationEnabledState.as((v) => v);

  const priority = wrapValue(rawPriority).as((p): ToastPriority => p);
  const isPersistent = wrapValue(rawPersistent).as((p) => Boolean(p));

  const customDuration = wrapValue(rawDuration);
  const duration = mergeValues(
    () => {
      const override = customDuration();
      if (override !== undefined) {
        return Number(override);
      }
      return region ? region.duration() : 5000;
    },
    { parents: region ? [customDuration, region.duration] : [customDuration] },
  );

  const swipeDirection = region ? region.swipeDirection : wrapValue<ToastSwipeDirection>("right").as((d) => d);
  const swipeThreshold = region ? region.swipeThreshold : wrapValue(50).as((t) => t);

  const lifeTimeState = createValue(100, { hydrate: false });
  const lifeTime = lifeTimeState.as((v) => v);

  let closeTimerId: ReturnType<typeof setTimeout> | undefined;
  let closeTimerStartTime = Date.now();
  let closeTimerRemainingTime = duration();

  const clearTimer = () => {
    if (closeTimerId !== undefined) {
      clearTimeout(closeTimerId);
      closeTimerId = undefined;
    }
  };

  const close = () => {
    if (!isOpenState()) return;
    isOpenState(false);
    isAnimationEnabledState(true);
    clearTimer();
    toastStore.remove(toastId);
  };

  const startTimer = (ms: number) => {
    inClient(() => {
      if (!ms || ms <= 0 || isPersistent()) {
        return;
      }
      clearTimer();
      closeTimerStartTime = Date.now();
      closeTimerId = setTimeout(close, ms);
    });
  };

  const pauseTimer = () => {
    inClient(() => {
      if (isPersistent()) return;
      const elapsedTime = Math.max(0, Date.now() - closeTimerStartTime);
      closeTimerRemainingTime = Math.max(0, closeTimerRemainingTime - elapsedTime);
      clearTimer();
      onPause?.();
    });
  };

  const resumeTimer = () => {
    inClient(() => {
      if (isPersistent()) return;
      startTimer(closeTimerRemainingTime);
      onResume?.();
    });
  };

  inClient(() => {
    // Start initial timer if not paused
    if (isOpenState() && !(region?.isPaused() ?? false)) {
      closeTimerRemainingTime = duration();
      startTimer(closeTimerRemainingTime);
    }

    const unwatchDuration = duration.watch((newDuration) => {
      closeTimerRemainingTime = newDuration;
      if (isOpenState() && !(region?.isPaused() ?? false)) {
        startTimer(newDuration);
      }
    });

    const unwatchPaused = region?.isPaused.watch((paused) => {
      if (paused) {
        pauseTimer();
      } else {
        resumeTimer();
      }
    });

    const unwatchStore = toastStore.toasts.watch((list) => {
      const current = list.find((t) => t.id === toastId);
      if (current?.dismiss) {
        close();
      }
    });

    onUnmounted(() => {
      clearTimer();
      unwatchDuration();
      unwatchPaused?.();
      unwatchStore();
    });
  });

  const generateId = (part: string) => `${id}-${part}`;

  const registerTitleId = (newTitleId: string) => {
    titleIdState(newTitleId);
    return () => titleIdState(undefined);
  };

  const registerDescriptionId = (newDescId: string) => {
    descriptionIdState(newDescId);
    return () => descriptionIdState(undefined);
  };

  return {
    id,
    toastId,
    dataComponent,
    translations,
    region,
    isOpen,
    priority,
    duration,
    isPersistent,
    isAnimationEnabled,
    swipeDirection,
    swipeThreshold,
    lifeTime,
    titleId,
    descriptionId,
    closeTimerStartTime: () => closeTimerStartTime,
    close,
    generateId,
    registerTitleId,
    registerDescriptionId,
    onSwipeStart,
    onSwipeMove,
    onSwipeCancel,
    onSwipeEnd,
    onEscapeKeyDown,
  };
}
