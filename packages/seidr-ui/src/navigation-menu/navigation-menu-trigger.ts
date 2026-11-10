import { isFn } from "@fimbul-works/hvat";
import {
  $,
  createRef,
  type DerivedValue,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_NAVIGATION_MENU, DATA_PART_TRIGGER } from "../constants.js";
import type { NavigationMenuTriggerProps } from "./types.js";

/**
 * Top-level trigger button in a NavigationMenu.
 */
export function NavigationMenuTrigger<T extends keyof SeidrElementTagNameMap = "button">(
  props: NavigationMenuTriggerProps<T> = {} as NavigationMenuTriggerProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "button" as T,
    instance: menu,
    navigationMenuInstance: navMenu,
    menuValue,
    dataComponent = DATA_COMPONENT_NAVIGATION_MENU,
    id: userId,
    ref: userRef,
    ariaLabel,
    ariaLabelledBy,
    ariaDescribedBy,
    type: userType,
    onclick: userOnClick,
    onfocus: userOnFocus,
    onpointerenter: userOnPointerEnter,
    onpointerleave: userOnPointerLeave,
    onkeydown: userOnKeyDown,
    children: propsChildren,
    ...rest
  } = props;

  if (!menu) {
    throw new SeidrError("NavigationMenuTrigger requires a menu instance coordinator");
  }

  if (!navMenu) {
    throw new SeidrError("NavigationMenuTrigger requires a navigationMenuInstance coordinator");
  }

  const value = menuValue ?? menu.id;
  const isHorizontal = () => navMenu.orientation() === "horizontal";

  const internalRef = createRef<SeidrElementTagNameMap[T]>();

  internalRef.bind((el) => {
    if (userRef && el && isFn(userRef)) {
      Reflect.apply(userRef, null, [el]);
    }
    if (el) {
      menu.triggerRef(el as unknown as HTMLElement);
    }
  });

  const isCurrentActive: DerivedValue<boolean> = navMenu.activeTrigger.as((a) => a === value);
  const isMenuOpen: DerivedValue<boolean> = menu.isOpen;

  const handleClick = (e: MouseEvent) => {
    if (isFn(userOnClick)) {
      Reflect.apply(userOnClick, e.currentTarget, [e]);
    }
    if (e.defaultPrevented) return;

    if (isMenuOpen()) {
      navMenu.closeMenu();
    } else {
      navMenu.openMenu(value);
    }
  };

  const handleFocus = (e: FocusEvent) => {
    if (isFn(userOnFocus)) {
      Reflect.apply(userOnFocus, e.currentTarget, [e]);
    }
    if (!e.defaultPrevented) {
      navMenu.activeTrigger(value);
    }
  };

  const handlePointerEnter = (e: PointerEvent) => {
    if (isFn(userOnPointerEnter)) {
      Reflect.apply(userOnPointerEnter, e.currentTarget, [e]);
    }
    if (e.defaultPrevented) return;

    navMenu.startHoverTimer(value);
  };

  const handlePointerLeave = (e: PointerEvent) => {
    if (isFn(userOnPointerLeave)) {
      Reflect.apply(userOnPointerLeave, e.currentTarget, [e]);
    }
    if (e.defaultPrevented) return;

    navMenu.startLeaveTimer();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (isFn(userOnKeyDown)) {
      Reflect.apply(userOnKeyDown, e.currentTarget, [e]);
    }
    if (e.defaultPrevented) return;

    const openKey = isHorizontal() ? "ArrowDown" : "ArrowRight";
    const openLastKey = isHorizontal() ? "ArrowUp" : "ArrowLeft";

    if (e.key === openKey || e.key === openLastKey) {
      e.preventDefault();
      e.stopPropagation();
      navMenu.openMenu(value, true);
      return;
    }

    if (e.key === "Escape" && isMenuOpen()) {
      e.preventDefault();
      e.stopPropagation();
      navMenu.closeMenu();
      return;
    }
  };

  const resolvedChildren: (SeidrChild | undefined)[] = [];
  if (children) {
    if (Array.isArray(children)) resolvedChildren.push(...children);
    else resolvedChildren.push(children);
  }
  if (propsChildren) {
    if (Array.isArray(propsChildren)) resolvedChildren.push(...propsChildren);
    else resolvedChildren.push(propsChildren);
  }

  const defaultType = as === "button" ? (userType ?? "button") : userType;

  return $(
    as,
    {
      id: userId ?? `${menu.id}-trigger`,
      ref: internalRef,
      type: defaultType,
      role: "menuitem",
      "aria-haspopup": "menu",
      "aria-expanded": isMenuOpen.as((o) => (o ? "true" : "false")),
      "aria-controls": menu.isOpen.as((o) => (o ? `${menu.id}-content` : undefined)),
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      "aria-describedby": ariaDescribedBy,
      tabindex: isCurrentActive.as((a) => (a ? 0 : -1)),
      dataComponent,
      dataPart: DATA_PART_TRIGGER,
      dataValue: value,
      dataState: isMenuOpen.as((o) => (o ? "open" : "closed")),
      dataExpanded: isMenuOpen.as((o) => (o ? "" : undefined)),
      onclick: handleClick,
      onfocus: handleFocus,
      onpointerenter: handlePointerEnter,
      onpointerleave: handlePointerLeave,
      onkeydown: handleKeyDown,
      ...rest,
    } as SeidrElementProps<T>,
    resolvedChildren,
  );
}
