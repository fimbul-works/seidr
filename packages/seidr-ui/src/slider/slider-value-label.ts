import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_SLIDER, DATA_PART_VALUE_LABEL } from "../constants.js";
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
    as,
    {
      dataOrientation: slider.orientation,
      dataDisabled: slider.isDisabled.as((d) => (d ? "" : undefined)),
      dataComponent: DATA_COMPONENT_SLIDER,
      dataPart: DATA_PART_VALUE_LABEL,
      ...rest,
    } as SeidrElementProps<T>,
    children ?? slider.getValueLabel,
  );
}
