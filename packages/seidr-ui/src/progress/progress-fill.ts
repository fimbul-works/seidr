import {
  $,
  mergeStyleProps,
  type ReactiveStyleDeclaration,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { ProgressFillProps } from "./types.js";

/**
 * Visual fill indicator showing the current progress percentage.
 */
export function ProgressFill<T extends keyof SeidrElementTagNameMap = "div">(
  props: ProgressFillProps<T> = {},
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "div" as T, instance: progress, style: userStyle, dataComponent, ...rest } = props;

  if (!progress) {
    throw new SeidrError("ProgressFill requires an instance coordinator");
  }

  const baseStyle = {
    width: progress.fillWidth,
  } as ReactiveStyleDeclaration;

  return $(
    as,
    {
      style: mergeStyleProps(baseStyle, userStyle),
      dataProgress: progress.role === "meter" ? undefined : progress.progressState,
      dataIndeterminate:
        progress.role === "meter" ? undefined : progress.isIndeterminate.as((i) => (i ? "" : undefined)),
      dataComponent: dataComponent ?? progress.dataComponent,
      dataPart: "fill",
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
