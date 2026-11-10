import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_SLIDER, DATA_PART_LABEL } from "../constants.js";
import type { SliderLabelProps } from "./types.js";

/**
 * Accessible label component for the slider.
 */
export function SliderLabel<T extends keyof SeidrElementTagNameMap = "label">(
  props: SliderLabelProps<T> = {},
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "label" as T, instance: slider, htmlFor: customFor, id: customId, ...rest } = props;

  if (!slider) {
    throw new SeidrError("SliderLabel requires an instance coordinator");
  }

  return $(
    as as T,
    {
      id: customId ?? `${slider.id}-label`,
      htmlFor: customFor ?? slider.generateInputId(0),
      dataOrientation: slider.orientation,
      dataDisabled: slider.isDisabled.as((d) => (d ? "" : undefined)),
      dataComponent: DATA_COMPONENT_SLIDER,
      dataPart: DATA_PART_LABEL,
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
