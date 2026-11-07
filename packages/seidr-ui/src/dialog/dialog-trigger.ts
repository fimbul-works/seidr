import { isFn } from "@fimbul-works/hvat";
import {
  $,
  createRef,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
  wrapValue,
} from "@fimbul-works/seidr";
import type { DialogTriggerProps } from "./types.js";

/**
 * Trigger element that opens the Dialog when clicked.
 */
export function DialogTrigger<T extends keyof SeidrElementTagNameMap = "button">(
  props: DialogTriggerProps<T> = {} as DialogTriggerProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "button" as T,
    instance: dialog,
    dataComponent = "dialog",
    type,
    disabled: disabledProp,
    ariaLabel,
    ariaLabelledBy,
    ref: userRef,
    onclick: userOnClick,
    ...rest
  } = props;

  if (!dialog) {
    throw new SeidrError("DialogTrigger requires an instance coordinator");
  }

  const internalRef = createRef<SeidrElementTagNameMap[T]>();

  internalRef.bind((el) => {
    if (userRef && el && isFn(userRef)) {
      Reflect.apply(userRef, null, [el]);
    }
    dialog.triggerRef(el as unknown as HTMLElement);
  });

  const isDisabled = wrapValue(disabledProp ?? false).as((d) => Boolean(d));

  const handleClick = (e: MouseEvent) => {
    if (isDisabled()) {
      e.preventDefault();
      return;
    }
    if (userOnClick && isFn(userOnClick)) {
      Reflect.apply(userOnClick, null, [e]);
    }
    if (!e.defaultPrevented) {
      dialog.toggle();
    }
  };

  return $(
    as,
    {
      ref: internalRef,
      type: as === "button" ? (type ?? "button") : type,
      disabled: as === "button" ? isDisabled : undefined,
      "aria-haspopup": "dialog",
      "aria-expanded": dialog.isOpen.as((o) => (o ? "true" : "false")),
      "aria-controls": dialog.contentId,
      "aria-disabled": as !== "button" ? isDisabled.as((d) => (d ? "true" : undefined)) : undefined,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      dataComponent,
      dataPart: "trigger",
      dataExpanded: dialog.isOpen.as((o) => (o ? "" : undefined)),
      dataClosed: dialog.isOpen.as((o) => (!o ? "" : undefined)),
      dataDisabled: isDisabled.as((d) => (d ? "" : undefined)),
      onclick: handleClick,
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}

