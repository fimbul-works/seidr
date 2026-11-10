import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_POPOVER, DATA_PART_DESCRIPTION } from "../constants.js";
import type { PopoverDescriptionProps } from "./types.js";

/**
 * An optional accessible description announced when the popover is open.
 */
export function PopoverDescription<T extends keyof SeidrElementTagNameMap = "p">(
  props: PopoverDescriptionProps<T> = {} as PopoverDescriptionProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "p" as T, instance: popover, dataComponent = DATA_COMPONENT_POPOVER, id: userId, ...rest } = props;

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
      dataPart: DATA_PART_DESCRIPTION,
      dataExpanded: popover.isOpen.as((o) => (o ? "" : undefined)),
      dataClosed: popover.isOpen.as((o) => (!o ? "" : undefined)),
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
