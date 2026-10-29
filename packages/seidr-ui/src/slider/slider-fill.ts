import { isObj } from "@fimbul-works/hvat";
import {
  $,
  mergeStyleProps,
  type ReactiveStyleDeclaration,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { SliderFillProps } from "./types.js";

/**
 * Visual element representing the active filled portion of the slider track.
 */
export function SliderFill<T extends keyof SeidrElementTagNameMap = "div">(
  props: SliderFillProps<T> = {},
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "div" as T, instance: slider, style: userStyle, ...rest } = props;

  if (!slider) {
    throw new SeidrError("SliderFill requires an instance coordinator");
  }

  const isVertical = slider.orientation === "vertical";

  const minPct = slider.values.as((vals) => {
    const percents = vals.map((v) => slider.getValuePercent(v));
    return vals.length > 1 ? Math.min(...percents) : 0;
  });

  const maxPct = slider.values.as((vals) => {
    const percents = vals.map((v) => slider.getValuePercent(v));
    return vals.length > 1 ? Math.max(...percents) : (percents[0] ?? 0);
  });

  const baseStyle: ReactiveStyleDeclaration = isVertical
    ? slider.inverted
      ? {
          top: minPct.as((p) => `${p * 100}%`),
          bottom: maxPct.as((p) => `${(1 - p) * 100}%`),
        }
      : {
          bottom: minPct.as((p) => `${p * 100}%`),
          top: maxPct.as((p) => `${(1 - p) * 100}%`),
        }
    : slider.inverted
      ? {
          right: minPct.as((p) => `${p * 100}%`),
          left: maxPct.as((p) => `${(1 - p) * 100}%`),
        }
      : {
          left: minPct.as((p) => `${p * 100}%`),
          right: maxPct.as((p) => `${(1 - p) * 100}%`),
        };

  const finalStyle = isObj(userStyle)
    ? mergeStyleProps(baseStyle, userStyle)
    : baseStyle;

  return $(
    as as T,
    {
      style: finalStyle,
      dataOrientation: slider.orientation,
      dataDisabled: slider.isDisabled.as((d) => (d ? "" : undefined)),
      dataComponent: "slider",
      dataPart: "fill",
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
