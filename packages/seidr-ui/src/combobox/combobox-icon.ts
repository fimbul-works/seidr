import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { ComboboxIconProps } from "./types.js";

/**
 * Visual indicator/icon displayed inside the Combobox (e.g. chevron).
 */
export function ComboboxIcon<T extends keyof SeidrElementTagNameMap = "span">(
  props: ComboboxIconProps<T> = {} as ComboboxIconProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "span" as T, instance: combobox, dataComponent = "combobox", ...rest } = props;

  if (!combobox) {
    throw new SeidrError("ComboboxIcon requires an instance coordinator");
  }

  return $(
    as,
    {
      ariaHidden: "true",
      dataComponent,
      dataPart: "icon",
      dataExpanded: combobox.isOpen.as((o) => (o ? "" : undefined)),
      dataClosed: combobox.isOpen.as((o) => (!o ? "" : undefined)),
      dataDisabled: combobox.isDisabled.as((d) => (d ? "" : undefined)),
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}

