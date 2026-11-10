import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_PART_LABEL } from "../constants.js";
import type { ProgressLabelProps } from "./types.js";

/**
 * Accessible text label for the progress bar.
 */
export function ProgressLabel<T extends keyof SeidrElementTagNameMap = "span">(
  props: ProgressLabelProps<T> = {},
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "span" as T, instance: progress, id: customId, dataComponent, ...rest } = props;

  if (!progress) {
    throw new SeidrError("ProgressLabel requires an instance coordinator");
  }

  return $(
    as,
    {
      id: customId ?? `${progress.id}-label`,
      dataProgress: progress.role === "meter" ? undefined : progress.progressState,
      dataIndeterminate:
        progress.role === "meter" ? undefined : progress.isIndeterminate.as((i) => (i ? "" : undefined)),
      dataComponent: dataComponent ?? progress.dataComponent,
      dataPart: DATA_PART_LABEL,
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
