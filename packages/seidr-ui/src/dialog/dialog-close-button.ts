import { isFn } from "@fimbul-works/hvat";
import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_DIALOG, DATA_PART_CLOSE_BUTTON } from "../constants.js";
import type { DialogCloseButtonProps } from "./types.js";

/**
 * Button element that closes the Dialog when clicked.
 */
export function DialogCloseButton<T extends keyof SeidrElementTagNameMap = "button">(
  props: DialogCloseButtonProps<T> = {} as DialogCloseButtonProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "button" as T,
    instance: dialog,
    dataComponent = DATA_COMPONENT_DIALOG,
    type,
    ariaLabel = "Close",
    onclick: userOnClick,
    ...rest
  } = props;

  if (!dialog) {
    throw new SeidrError("DialogCloseButton requires an instance coordinator");
  }

  const handleClick = (e: MouseEvent) => {
    if (userOnClick && isFn(userOnClick)) {
      Reflect.apply(userOnClick, null, [e]);
    }
    if (!e.defaultPrevented) {
      dialog.close();
    }
  };

  return $(
    as,
    {
      type: as === "button" ? (type ?? "button") : type,
      "aria-label": ariaLabel,
      dataComponent,
      dataPart: DATA_PART_CLOSE_BUTTON,
      dataExpanded: dialog.isOpen.as((o) => (o ? "" : undefined)),
      dataClosed: dialog.isOpen.as((o) => (!o ? "" : undefined)),
      onclick: handleClick,
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
