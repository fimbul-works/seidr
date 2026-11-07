import type { SeidrChild, SeidrElementTagNameMap } from "@fimbul-works/seidr";
import { ToastCloseButton } from "./toast-close-button.js";
import { ToastDescription } from "./toast-description.js";
import { ToastProgressFill } from "./toast-progress-fill.js";
import { ToastProgressTrack } from "./toast-progress-track.js";
import { ToastRoot } from "./toast-root.js";
import { ToastTitle } from "./toast-title.js";
import type {
  ToastCloseButtonProps,
  ToastDescriptionProps,
  ToastInstance,
  ToastProgressFillProps,
  ToastProgressTrackProps,
  ToastRootProps,
  ToastTitleProps,
  UseToastOptions,
} from "./types.js";
import { useToast } from "./use-toast.js";

/**
 * Creates a headless coordinator for an individual Toast item (Tier 2).
 * Returns pre-bound Root, Title, Description, CloseButton, ProgressTrack, and ProgressFill helpers.
 */
export function createToast(options: UseToastOptions): ToastInstance {
  const instance = useToast(options);

  return {
    ...instance,
    Root: <T extends keyof SeidrElementTagNameMap = "li">(
      props?: ToastRootProps<T>,
      children?: SeidrChild | SeidrChild[],
    ) => ToastRoot<T>({ instance, ...props } as ToastRootProps<T>, children),
    Title: <T extends keyof SeidrElementTagNameMap = "div">(
      props?: ToastTitleProps<T>,
      children?: SeidrChild | SeidrChild[],
    ) => ToastTitle<T>({ instance, ...props } as ToastTitleProps<T>, children),
    Description: <T extends keyof SeidrElementTagNameMap = "div">(
      props?: ToastDescriptionProps<T>,
      children?: SeidrChild | SeidrChild[],
    ) => ToastDescription<T>({ instance, ...props } as ToastDescriptionProps<T>, children),
    CloseButton: <T extends keyof SeidrElementTagNameMap = "button">(
      props?: ToastCloseButtonProps<T>,
      children?: SeidrChild | SeidrChild[],
    ) => ToastCloseButton<T>({ instance, ...props } as ToastCloseButtonProps<T>, children),
    ProgressTrack: <T extends keyof SeidrElementTagNameMap = "div">(
      props?: ToastProgressTrackProps<T>,
      children?: SeidrChild | SeidrChild[],
    ) => ToastProgressTrack<T>({ instance, ...props } as ToastProgressTrackProps<T>, children),
    ProgressFill: <T extends keyof SeidrElementTagNameMap = "div">(
      props?: ToastProgressFillProps<T>,
      children?: SeidrChild | SeidrChild[],
    ) => ToastProgressFill<T>({ instance, ...props } as ToastProgressFillProps<T>, children),
  };
}

