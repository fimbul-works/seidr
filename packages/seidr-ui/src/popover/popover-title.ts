import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { PopoverTitleProps } from "./types.js";

/**
 * An accessible title announced when the popover is open.
 */
export function PopoverTitle<T extends keyof SeidrElementTagNameMap = "h2">(
  props: PopoverTitleProps<T> = {} as PopoverTitleProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "h2" as T,
    instance: popover,
    dataComponent = "popover",
    id: userId,
    ...rest
  } = props;

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
      dataPart: "title",
      dataExpanded: popover.isOpen.as((o) => (o ? "" : undefined)),
      dataClosed: popover.isOpen.as((o) => (!o ? "" : undefined)),
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}

