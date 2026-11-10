import { isFn } from "@fimbul-works/hvat";
import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_POPOVER, DATA_PART_CLOSE_BUTTON } from "../constants.js";
import type { PopoverCloseButtonProps } from "./types.js";

/**
 * The button that closes the popover.
 */
export function PopoverCloseButton<T extends keyof SeidrElementTagNameMap = "button">(
  props: PopoverCloseButtonProps<T> = {} as PopoverCloseButtonProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "button" as T,
    instance: popover,
    dataComponent = DATA_COMPONENT_POPOVER,
    type,
    ariaLabel = "Dismiss",
    onclick: userOnClick,
    ...rest
  } = props;

  if (!popover) {
    throw new SeidrError("PopoverCloseButton requires an instance coordinator");
  }

  const handleClick = (e: MouseEvent) => {
    if (isFn(userOnClick)) {
      Reflect.apply(userOnClick, e.currentTarget, [e]);
    }
    if (!e.defaultPrevented) {
      popover.close();
    }
  };

  return $(
    as,
    {
      type: as === "button" ? (type ?? "button") : type,
      "aria-label": ariaLabel,
      dataComponent,
      dataPart: DATA_PART_CLOSE_BUTTON,
      dataExpanded: popover.isOpen.as((o) => (o ? "" : undefined)),
      dataClosed: popover.isOpen.as((o) => (!o ? "" : undefined)),
      onclick: handleClick,
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
