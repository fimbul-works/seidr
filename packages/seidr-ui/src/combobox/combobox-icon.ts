import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_COMBOBOX, DATA_PART_ICON } from "../constants.js";
import type { ComboboxIconProps } from "./types.js";

/**
 * Visual indicator/icon displayed inside the Combobox (e.g. chevron).
 */
export function ComboboxIcon<T extends keyof SeidrElementTagNameMap = "span">(
  props: ComboboxIconProps<T> = {} as ComboboxIconProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "span" as T, instance: combobox, dataComponent = DATA_COMPONENT_COMBOBOX, ...rest } = props;

  if (!combobox) {
    throw new SeidrError("ComboboxIcon requires an instance coordinator");
  }

  return $(
    as,
    {
      ariaHidden: "true",
      dataComponent,
      dataPart: DATA_PART_ICON,
      dataExpanded: combobox.isOpen.as((o) => (o ? "" : undefined)),
      dataClosed: combobox.isOpen.as((o) => (!o ? "" : undefined)),
      dataDisabled: combobox.isDisabled.as((d) => (d ? "" : undefined)),
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
