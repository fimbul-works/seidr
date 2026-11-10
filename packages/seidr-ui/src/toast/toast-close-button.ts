import { type SeidrChild, type SeidrElementProps, type SeidrElementTagNameMap, SeidrError } from "@fimbul-works/seidr";
import { Button } from "../button.js";
import { DATA_PART_CLOSE_BUTTON } from "../constants.js";
import type { ToastCloseButtonProps } from "./types.js";

/**
 * Button (`data-part="close-button"`) that closes the toast when clicked.
 */
export function ToastCloseButton<T extends keyof SeidrElementTagNameMap = "button">(
  props?: ToastCloseButtonProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "button" as T,
    instance: toast,
    dataComponent,
    ariaLabel,
    "aria-label": ariaLabelHyphen,
    onclick: userOnClick,
    ...rest
  } = props ?? ({} as ToastCloseButtonProps<T>);

  if (!toast) {
    throw new SeidrError("ToastCloseButton requires a Toast instance coordinator");
  }

  const handleClick = (e: MouseEvent) => {
    if (typeof userOnClick === "function") {
      (userOnClick as (event: MouseEvent) => void)(e);
    }
    toast.close();
  };

  return Button(
    {
      as,
      ariaLabel: ariaLabel ?? ariaLabelHyphen ?? toast.translations.close,
      dataComponent: dataComponent ?? toast.dataComponent,
      dataPart: DATA_PART_CLOSE_BUTTON,
      onclick: handleClick,
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
