import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_POPOVER, DATA_PART_ROOT } from "../constants.js";
import type { PopoverRootProps } from "./types.js";

/**
 * Root container element for a Popover.
 */
export function PopoverRoot<T extends keyof SeidrElementTagNameMap = "div">(
  props: PopoverRootProps<T> = {} as PopoverRootProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "div" as T, instance: popover, dataComponent = DATA_COMPONENT_POPOVER, ...rest } = props;

  if (!popover) {
    throw new SeidrError("PopoverRoot requires an instance coordinator");
  }

  return $(
    as,
    {
      dataComponent,
      dataPart: DATA_PART_ROOT,
      dataExpanded: popover.isOpen.as((o) => (o ? "" : undefined)),
      dataClosed: popover.isOpen.as((o) => (!o ? "" : undefined)),
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
