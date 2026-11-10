import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_COMBOBOX, DATA_PART_ROOT } from "../constants.js";
import type { ComboboxRootProps } from "./types.js";

/**
 * Root container element for a Combobox widget.
 */
export function ComboboxRoot<T extends keyof SeidrElementTagNameMap = "div">(
  props: ComboboxRootProps<T> = {} as ComboboxRootProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "div" as T, instance: combobox, dataComponent = DATA_COMPONENT_COMBOBOX, id: customId, ...rest } = props;

  if (!combobox) {
    throw new SeidrError("ComboboxRoot requires an instance coordinator");
  }

  return $(
    as,
    {
      id: customId ?? combobox.id,
      role: "group",
      dataComponent,
      dataPart: DATA_PART_ROOT,
      dataExpanded: combobox.isOpen.as((o) => (o ? "" : undefined)),
      dataClosed: combobox.isOpen.as((o) => (!o ? "" : undefined)),
      dataDisabled: combobox.isDisabled.as((d) => (d ? "" : undefined)),
      dataReadonly: combobox.isReadOnly.as((r) => (r ? "" : undefined)),
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
