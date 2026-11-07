import { isFn } from "@fimbul-works/hvat";
import {
  $,
  createRef,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { ComboboxListboxProps } from "./types.js";

/**
 * Listbox container element for options within a Combobox dropdown.
 */
export function ComboboxListbox<T extends keyof SeidrElementTagNameMap = "ul">(
  props: ComboboxListboxProps<T> = {} as ComboboxListboxProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "ul" as T,
    instance: combobox,
    dataComponent = "combobox",
    id: userId,
    ref: userRef,
    onfocusin: userOnFocusIn,
    ...rest
  } = props;

  if (!combobox) {
    throw new SeidrError("ComboboxListbox requires an instance coordinator");
  }

  const internalRef = createRef<SeidrElementTagNameMap[T]>();

  internalRef.bind((el) => {
    if (userRef && el && isFn(userRef)) {
      Reflect.apply(userRef, null, [el]);
    }
    combobox.listboxRef(el as unknown as HTMLElement);
  });

  const handleFocusIn = (e: FocusEvent) => {
    if (typeof userOnFocusIn === "function") {
      Reflect.apply(userOnFocusIn, e.currentTarget, [e]);
    }
    if (!e.defaultPrevented) {
      combobox.listbox.handleRootFocus(e);
    }
  };

  return $(
    as,
    {
      ref: internalRef,
      id: userId ?? combobox.listboxId,
      role: "listbox",
      dataComponent,
      dataPart: "listbox",
      tabindex: -1,
      ariaOrientation: combobox.listbox.orientation,
      ariaMultiselectable: combobox.isMultiple ? "true" : undefined,
      ariaLabelledby: combobox.labelId,
      onfocusin: handleFocusIn,
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}

