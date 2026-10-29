import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { SliderValueLabelProps } from "./types.js";

/**
 * Accessible text display of the slider's current formatted value.
 */
export function SliderValueLabel<T extends keyof SeidrElementTagNameMap = "div">(
  props: SliderValueLabelProps<T> = {},
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "div" as T, instance: slider, ...rest } = props;

  if (!slider) {
    throw new SeidrError("SliderValueLabel requires an instance coordinator");
  }

  return $(
    as as T,
    {
      dataOrientation: slider.orientation,
      dataDisabled: slider.isDisabled.as((d) => (d ? "" : undefined)),
      dataComponent: "slider",
      dataPart: "value-label",
      ...rest,
    } as SeidrElementProps<T>,
    children ?? slider.getValueLabel,
  );
}
