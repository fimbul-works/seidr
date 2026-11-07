import { isFn } from "@fimbul-works/hvat";
import {
  $,
  createRef,
  onUnmounted,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { ListboxRootProps } from "./types.js";

/**
 * Root container for a listbox widget (`role="listbox"`).
 */
export function ListboxRoot<T extends keyof SeidrElementTagNameMap = "ul">(
  props: ListboxRootProps<T> = {} as ListboxRootProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "ul" as T,
    instance: listbox,
    dataComponent = "listbox",
    ref: userRef,
    onkeydown: userOnKeyDown,
    onfocusin: userOnFocusIn,
    onfocus: userOnFocus,
    ...rest
  } = props;

  if (!listbox) {
    throw new SeidrError("ListboxRoot requires an instance coordinator");
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (isFn(userOnKeyDown)) {
      Reflect.apply(userOnKeyDown, e.currentTarget, [e]);
    }
    if (e.defaultPrevented) return;
    listbox.handleRootKeyDown(e);
  };

  const handleFocus = (e: FocusEvent) => {
    if (isFn(userOnFocus)) {
      Reflect.apply(userOnFocus, e.currentTarget, [e]);
    }
    listbox.handleRootFocus(e);
  };

  const handleFocusIn = (e: FocusEvent) => {
    if (isFn(userOnFocusIn)) {
      Reflect.apply(userOnFocusIn, e.currentTarget, [e]);
    }
    listbox.handleRootFocus(e);
  };

  const rootRef = createRef<SeidrElementTagNameMap[T]>();

  rootRef.bind((el) => {
    if (userRef && el && isFn(userRef)) {
      Reflect.apply(userRef, null, [el]);
    }
    if (el) {
      el.addEventListener("focusin", handleFocusIn);
    }
  });

  onUnmounted(() => {
    const el = rootRef();
    if (el) {
      el.removeEventListener("focusin", handleFocusIn);
    }
  });

  return $(
    as,
    {
      ref: rootRef,
      id: listbox.id,
      role: "listbox",
      dataComponent,
      dataPart: "root",
      dataOrientation: listbox.orientation,
      dataDisabled: listbox.isDisabled.as((d) => (d ? "" : undefined)),
      ariaOrientation: listbox.orientation,
      ariaMultiselectable: listbox.selectionMode === "multiple" ? "true" : undefined,
      ariaDisabled: listbox.isDisabled.as((d) => (d ? "true" : undefined)),
      onkeydown: handleKeyDown,
      onfocusin: handleFocusIn,
      onfocus: handleFocus,
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
