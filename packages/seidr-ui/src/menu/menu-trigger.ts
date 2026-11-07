import { isFn } from "@fimbul-works/hvat";
import {
  $,
  createRef,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { MenuTriggerProps } from "./types.js";

/**
 * Trigger button element for activating a Menu dropdown.
 */
export function MenuTrigger<T extends keyof SeidrElementTagNameMap = "button">(
  props: MenuTriggerProps<T> = {} as MenuTriggerProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "button" as T,
    instance: menu,
    dataComponent = "menu",
    id: userId,
    ref: userRef,
    ariaLabel,
    ariaLabelledBy,
    ariaDescribedBy,
    onkeydown: userOnKeyDown,
    onclick: userOnClick,
    type: userType,
    ...rest
  } = props;

  if (!menu) {
    throw new SeidrError("MenuTrigger requires an instance coordinator");
  }

  const internalRef = createRef<SeidrElementTagNameMap[T]>();

  internalRef.bind((el) => {
    if (userRef && el && isFn(userRef)) {
      Reflect.apply(userRef, null, [el]);
    }
    menu.triggerRef(el as unknown as HTMLElement);
  });

  const handleKeyDown = (e: KeyboardEvent) => {
    if (isFn(userOnKeyDown)) {
      Reflect.apply(userOnKeyDown, e.currentTarget, [e]);
    }
    if (!e.defaultPrevented) {
      menu.handleTriggerKeyDown(e);
    }
  };

  const handleClick = (e: MouseEvent) => {
    if (isFn(userOnClick)) {
      Reflect.apply(userOnClick, e.currentTarget, [e]);
    }
    if (!e.defaultPrevented) {
      menu.handleTriggerClick(e);
    }
  };

  const isButton = as === "button";

  return $(
    as,
    {
      id: userId ?? menu.triggerId,
      ref: internalRef,
      type: isButton ? (userType ?? "button") : undefined,
      role: !isButton ? "button" : undefined,
      tabIndex: !isButton ? 0 : undefined,
      "aria-haspopup": "menu",
      "aria-expanded": menu.isOpen.as((o) => (o ? "true" : "false")),
      "aria-controls": menu.contentId,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      "aria-describedby": ariaDescribedBy,
      dataComponent,
      dataPart: "trigger",
      dataExpanded: menu.isOpen.as((o) => (o ? "" : undefined)),
      dataClosed: menu.isOpen.as((o) => (!o ? "" : undefined)),
      onclick: handleClick,
      onkeydown: handleKeyDown,
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}

