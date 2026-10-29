import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
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
      dataComponent: "slider",
      dataPart: "label",
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
