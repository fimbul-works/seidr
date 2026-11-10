import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_POPOVER, DATA_PART_TITLE } from "../constants.js";
import type { PopoverTitleProps } from "./types.js";

/**
 * An accessible title announced when the popover is open.
 */
export function PopoverTitle<T extends keyof SeidrElementTagNameMap = "h2">(
  props: PopoverTitleProps<T> = {} as PopoverTitleProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "h2" as T, instance: popover, dataComponent = DATA_COMPONENT_POPOVER, id: userId, ...rest } = props;

  if (!popover) {
    throw new SeidrError("PopoverTitle requires an instance coordinator");
  }

  if (typeof userId === "string") {
    popover.titleId(userId);
  }

  return $(
    as,
    {
      id: userId ?? popover.titleId,
      dataComponent,
      dataPart: DATA_PART_TITLE,
      dataExpanded: popover.isOpen.as((o) => (o ? "" : undefined)),
      dataClosed: popover.isOpen.as((o) => (!o ? "" : undefined)),
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
