import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { ToastProgressTrackProps } from "./types.js";

/**
 * Container (`role="presentation" aria-hidden="true" data-part="progress-track"`) for ToastProgressFill.
 */
export function ToastProgressTrack<T extends keyof SeidrElementTagNameMap = "div">(
  props: ToastProgressTrackProps<T> = {},
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "div" as T,
    instance: toast,
    role = "presentation",
    dataComponent,
    ...rest
  } = props;

  if (!toast) {
    throw new SeidrError("ToastProgressTrack requires a Toast instance coordinator");
  }

  return $<T>(
    as,
    {
      role,
      ariaHidden: "true",
      dataComponent: dataComponent ?? toast.dataComponent,
      dataPart: "progress-track",
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}

