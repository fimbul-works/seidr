import { isFn } from "@fimbul-works/hvat";
import {
  $,
  createRef,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { SelectListboxProps } from "./types.js";

/**
 * Listbox container element for options within a Select dropdown.
 */
export function SelectListbox<T extends keyof SeidrElementTagNameMap = "ul">(
  props: SelectListboxProps<T> = {} as SelectListboxProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "ul" as T,
    instance: select,
    dataComponent = "select",
    id: userId,
    ref: userRef,
    onkeydown: userOnKeyDown,
    onfocusin: userOnFocusIn,
    ...rest
  } = props;

  if (!select) {
    throw new SeidrError("SelectListbox requires an instance coordinator");
  }

  const internalRef = createRef<SeidrElementTagNameMap[T]>();

  internalRef.bind((el) => {
    if (userRef && el && isFn(userRef)) {
      Reflect.apply(userRef, null, [el]);
    }
    select.listboxRef(el as unknown as HTMLElement);
  });

  const handleKeyDown = (e: KeyboardEvent) => {
    if (typeof userOnKeyDown === "function") {
      Reflect.apply(userOnKeyDown, e.currentTarget, [e]);
    }
    if (e.defaultPrevented) return;

    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      select.close();
      return;
    }

    select.listbox.handleRootKeyDown(e);
  };

  const handleFocusIn = (e: FocusEvent) => {
    if (typeof userOnFocusIn === "function") {
      Reflect.apply(userOnFocusIn, e.currentTarget, [e]);
    }
    if (!e.defaultPrevented) {
      select.listbox.handleRootFocus(e);
    }
  };

  return $(
    as,
    {
      ref: internalRef,
      id: userId ?? select.listboxId,
      role: "listbox",
      dataComponent,
      dataPart: "listbox",
      tabindex: -1,
      ariaOrientation: select.listbox.orientation,
      ariaMultiselectable: select.isMultiple ? "true" : undefined,
      ariaLabelledby: select.labelId,
      onkeydown: handleKeyDown,
      onfocusin: handleFocusIn,
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
