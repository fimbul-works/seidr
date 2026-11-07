import { createComponent } from "@fimbul-works/seidr";
import { createToast } from "./create-toast.js";
import type { ToastProps, ToastRootProps } from "./types.js";

/**
 * Unified all-in-one Toast item component (Tier 1).
 * Renders an accessible toast notification (`role="status"`) with optional title, description,
 * close button, and progress bar.
 */
export const Toast = createComponent((props: ToastProps) => {
  const {
    id,
    toastId,
    region,
    translations,
    priority,
    duration,
    persistent,
    onPause,
    onResume,
    onSwipeStart,
    onSwipeMove,
    onSwipeCancel,
    onSwipeEnd,
    onEscapeKeyDown,
    dataComponent,
    as = "li",
    title,
    description,
    closeButton = true,
    showProgress = false,
    rootProps = {},
    titleProps = {},
    descriptionProps = {},
    closeButtonProps = {},
    progressTrackProps = {},
    progressFillProps = {},
    children,
  } = props;

  const toast = createToast({
    id,
    toastId,
    region,
    translations,
    priority,
    duration,
    persistent,
    onPause,
    onResume,
    onSwipeStart,
    onSwipeMove,
    onSwipeCancel,
    onSwipeEnd,
    onEscapeKeyDown,
    dataComponent,
  });

  const titleEl = title ? toast.Title(titleProps, title) : null;
  const descriptionEl = description ? toast.Description(descriptionProps, description) : null;
  const closeButtonEl = closeButton
    ? toast.CloseButton(closeButtonProps, typeof closeButton === "boolean" ? "✕" : closeButton)
    : null;
  const progressEl = showProgress
    ? toast.ProgressTrack(progressTrackProps, [toast.ProgressFill(progressFillProps)])
    : null;

  return toast.Root({ as, ...rootProps } as ToastRootProps<"li">, [
    titleEl,
    descriptionEl,
    children,
    closeButtonEl,
    progressEl,
  ]);
}, "Toast");

