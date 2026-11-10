import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_SELECT, DATA_PART_ICON } from "../constants.js";
import type { SelectIconProps } from "./types.js";

/**
 * Visual indicator icon element for a Select trigger.
 */
export function SelectIcon<T extends keyof SeidrElementTagNameMap = "span">(
  props: SelectIconProps<T> = {} as SelectIconProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "span" as T, instance: select, dataComponent = DATA_COMPONENT_SELECT, ...rest } = props;

  if (!select) {
    throw new SeidrError("SelectIcon requires an instance coordinator");
  }

  const iconChildren = children !== undefined && children !== null ? children : "▼";

  return $(
    as,
    {
      dataComponent,
      dataPart: DATA_PART_ICON,
      ariaHidden: "true",
      dataExpanded: select.isOpen.as((o) => (o ? "" : undefined)),
      dataClosed: select.isOpen.as((o) => (!o ? "" : undefined)),
      dataDisabled: select.isDisabled.as((d) => (d ? "" : undefined)),
      ...rest,
    } as SeidrElementProps<T>,
    iconChildren,
  );
}
