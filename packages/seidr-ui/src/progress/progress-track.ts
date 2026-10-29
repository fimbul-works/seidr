import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { ProgressTrackProps } from "./types.js";

/**
 * Visual track element containing the progress fill.
 */
export function ProgressTrack<T extends keyof SeidrElementTagNameMap = "div">(
  props: ProgressTrackProps<T> = {},
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "div" as T, instance: progress, dataComponent, ...rest } = props;

  if (!progress) {
    throw new SeidrError("ProgressTrack requires an instance coordinator");
  }

  return $(
    as,
    {
      dataProgress: progress.role === "meter" ? undefined : progress.progressState,
      dataIndeterminate:
        progress.role === "meter" ? undefined : progress.isIndeterminate.as((i) => (i ? "" : undefined)),
      dataComponent: dataComponent ?? progress.dataComponent,
      dataPart: "track",
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
