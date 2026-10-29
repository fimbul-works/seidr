import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { extractAriaProps } from "../utils/aria.js";
import type { ProgressRootProps } from "./types.js";

/**
 * Root container for progress bar elements (role="progressbar").
 */
export function ProgressRoot<T extends keyof SeidrElementTagNameMap = "div">(
  props: ProgressRootProps<T> = {},
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "div" as T } = props;
  const [aria, restProps] = extractAriaProps(props);

  const { instance: progress, id: customId, role, dataComponent, ...rest } = restProps;

  if (!progress) {
    throw new SeidrError("ProgressRoot requires an instance coordinator");
  }

  const effectiveAriaLabel = aria.ariaLabel;
  const effectiveAriaLabelledby = aria.ariaLabelledBy ?? (effectiveAriaLabel ? undefined : `${progress.id}-label`);

  return $<T>(
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
