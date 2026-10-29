import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { SliderErrorMessageProps } from "./types.js";

/**
 * Accessible validation error message text for the slider.
 */
export function SliderErrorMessage<T extends keyof SeidrElementTagNameMap = "div">(
  props: SliderErrorMessageProps<T> = {},
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "div" as T, instance: slider, ...rest } = props;

  if (!slider) {
    throw new SeidrError("SliderErrorMessage requires an instance coordinator");
  }

  return $(
    as as T,
    {
      id: `${slider.id}-error-message`,
      role: "alert",
      dataOrientation: slider.orientation,
      dataDisabled: slider.isDisabled.as((d) => (d ? "" : undefined)),
      dataComponent: "slider",
      dataPart: "error-message",
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
