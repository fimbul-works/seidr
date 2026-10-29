import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
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
    as as T,
    {
      id: `${slider.id}-description`,
      dataOrientation: slider.orientation,
      dataDisabled: slider.isDisabled.as((d) => (d ? "" : undefined)),
      dataComponent: "slider",
      dataPart: "description",
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
