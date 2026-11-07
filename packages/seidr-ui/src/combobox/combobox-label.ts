import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { ComboboxLabelProps } from "./types.js";

/**
 * Accessible label element for a Combobox component.
 */
export function ComboboxLabel<T extends keyof SeidrElementTagNameMap = "label">(
  props: ComboboxLabelProps<T> = {} as ComboboxLabelProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "label" as T,
    instance: combobox,
    dataComponent = "combobox",
    id: userId,
    onclick: userOnClick,
    ...rest
  } = props;

  if (!combobox) {
    throw new SeidrError("ComboboxLabel requires an instance coordinator");
  }

  const handleClick = (e: MouseEvent) => {
    if (typeof userOnClick === "function") {
      Reflect.apply(userOnClick, e.currentTarget, [e]);
    }
    if (!e.defaultPrevented && !combobox.isDisabled()) {
      combobox.inputRef()?.focus();
    }
  };

  return $(
    as,
    {
      id: userId ?? combobox.labelId,
      htmlFor: as === "label" ? combobox.inputId : undefined,
      dataComponent,
      dataPart: "label",
      dataDisabled: combobox.isDisabled.as((d) => (d ? "" : undefined)),
      onclick: handleClick,
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}

