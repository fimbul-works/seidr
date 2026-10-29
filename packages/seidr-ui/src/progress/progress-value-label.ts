import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { ProgressValueLabelProps } from "./types.js";

/**
 * Text element displaying the current formatted progress percentage or custom label.
 */
export function ProgressValueLabel<T extends keyof SeidrElementTagNameMap = "span">(
  props: ProgressValueLabelProps<T> = {},
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "span" as T, instance: progress, id: customId, dataComponent, ...rest } = props;

  if (!progress) {
    throw new SeidrError("ProgressValueLabel requires an instance coordinator");
  }

  return $(
    as,
    {
      id: customId ?? `${progress.id}-value-label`,
      dataProgress: progress.role === "meter" ? undefined : progress.progressState,
      dataIndeterminate:
        progress.role === "meter" ? undefined : progress.isIndeterminate.as((i) => (i ? "" : undefined)),
      dataComponent: dataComponent ?? progress.dataComponent,
      dataPart: "value-label",
      ...rest,
    } as SeidrElementProps<T>,
    children ?? progress.valueLabel,
  );
}
