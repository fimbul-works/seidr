import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_SLIDER, DATA_PART_DESCRIPTION } from "../constants.js";
import type { SliderDescriptionProps } from "./types.js";

/**
 * Optional helper or description text for the slider.
 */
export function SliderDescription<T extends keyof SeidrElementTagNameMap = "div">(
  props: SliderDescriptionProps<T> = {},
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "div" as T, instance: slider, ...rest } = props;

  if (!slider) {
    throw new SeidrError("SliderDescription requires an instance coordinator");
  }

  return $(
    as,
    {
      id: `${slider.id}-description`,
      dataOrientation: slider.orientation,
      dataDisabled: slider.isDisabled.as((d) => (d ? "" : undefined)),
      dataComponent: DATA_COMPONENT_SLIDER,
      dataPart: DATA_PART_DESCRIPTION,
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
