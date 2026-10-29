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

  const dynamicStyle = slider.values.as((vals) => {
    const percents = vals.map((v) => slider.getValuePercent(v));
    const minPct = vals.length > 1 ? Math.min(...percents) : 0;
    const maxPct = vals.length > 1 ? Math.max(...percents) : (percents[0] ?? 0);

    if (isVertical) {
      if (slider.inverted) {
        return {
          top: `${minPct * 100}%`,
          bottom: `${(1 - maxPct) * 100}%`,
        };
      }
      return {
        bottom: `${minPct * 100}%`,
        top: `${(1 - maxPct) * 100}%`,
      };
    }

    if (slider.inverted) {
      return {
        right: `${minPct * 100}%`,
        left: `${(1 - maxPct) * 100}%`,
      };
    }

    return {
      left: `${minPct * 100}%`,
      right: `${(1 - maxPct) * 100}%`,
    };
  });

  const finalStyle = isObj(userStyle)
    ? mergeStyleProps(dynamicStyle as any, userStyle as ReactiveStyleDeclaration)
    : (dynamicStyle as any);

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
