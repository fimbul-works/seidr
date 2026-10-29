import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { ProgressRootProps } from "./types.js";

/**
 * Root container for progress bar elements (role="progressbar").
 */
export function ProgressRoot<T extends keyof SeidrElementTagNameMap = "div">(
  props: ProgressRootProps<T> = {},
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "div" as T,
    instance: progress,
    id: customId,
    role,
    dataComponent,
    ariaLabel,
    ariaLabelledby,
    ...rest
  } = props;

  if (!progress) {
    throw new SeidrError("ProgressRoot requires an instance coordinator");
  }

  const effectiveAriaLabel = ariaLabel ?? (rest as Record<string, unknown>)["aria-label"];
  const effectiveAriaLabelledby =
    ariaLabelledby ??
    (rest as Record<string, unknown>)["aria-labelledby"] ??
    (effectiveAriaLabel ? undefined : `${progress.id}-label`);

  return $(
    as,
    {
      id: customId ?? progress.id,
      role: role ?? progress.role,
      ariaValuemin: progress.minValue,
      ariaValuemax: progress.maxValue,
      ariaValuenow: progress.isIndeterminate.as((i) => (i ? undefined : progress.value())),
      ariaValuetext: progress.valueLabel,
      ariaLabel: effectiveAriaLabel,
      ariaLabelledby: effectiveAriaLabelledby,
      dataProgress: progress.role === "meter" ? undefined : progress.progressState,
      dataIndeterminate:
        progress.role === "meter" ? undefined : progress.isIndeterminate.as((i) => (i ? "" : undefined)),
      dataComponent: dataComponent ?? progress.dataComponent,
      dataPart: "root",
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
