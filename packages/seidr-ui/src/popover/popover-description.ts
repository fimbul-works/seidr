import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { PopoverDescriptionProps } from "./types.js";

/**
 * An optional accessible description announced when the popover is open.
 */
export function PopoverDescription<T extends keyof SeidrElementTagNameMap = "p">(
  props: PopoverDescriptionProps<T> = {} as PopoverDescriptionProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "p" as T,
    instance: popover,
    dataComponent = "popover",
    id: userId,
    ...rest
  } = props;

  if (!popover) {
    throw new SeidrError("PopoverDescription requires an instance coordinator");
  }

  if (typeof userId === "string") {
    popover.descriptionId(userId);
  }

  return $(
    as,
    {
      id: userId ?? popover.descriptionId,
      dataComponent,
      dataPart: "description",
      dataExpanded: popover.isOpen.as((o) => (o ? "" : undefined)),
      dataClosed: popover.isOpen.as((o) => (!o ? "" : undefined)),
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}

