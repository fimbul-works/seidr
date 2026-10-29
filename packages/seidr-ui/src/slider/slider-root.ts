import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { SliderRootProps } from "./types.js";

/**
 * Root container for all parts of a slider component (role="group").
 */
export function SliderRoot<T extends keyof SeidrElementTagNameMap = "div">(
  props: SliderRootProps<T> = {},
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "div" as T, instance: slider, ...rest } = props;

  if (!slider) {
    throw new SeidrError("SliderRoot requires an instance coordinator");
  }

  return $(
    as as T,
    {
      id: slider.id,
      role: "group",
      dataOrientation: slider.orientation,
      dataDisabled: slider.isDisabled.as((d) => (d ? "" : undefined)),
      dataReadonly: slider.isReadOnly.as((r) => (r ? "" : undefined)),
      dataComponent: "slider",
      dataPart: "root",
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
