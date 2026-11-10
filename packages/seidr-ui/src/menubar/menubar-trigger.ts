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
import { DATA_COMPONENT_MENUBAR, DATA_PART_TRIGGER } from "../constants.js";
import type { MenubarTriggerProps } from "./types.js";

/**
 * Top-level trigger button in a Menubar (role="menuitem" with aria-haspopup="menu").
 */
export function MenubarTrigger<T extends keyof SeidrElementTagNameMap = "button">(
  props: MenubarTriggerProps<T> = {} as MenubarTriggerProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "button" as T,
    instance: menu,
    menubarInstance: menubar,
    menuValue,
    dataComponent = DATA_COMPONENT_MENUBAR,
    id: userId,
    ref: userRef,
    ariaLabel,
    ariaLabelledBy,
    ariaDescribedBy,
    type: userType,
    onclick: userOnClick,
    onfocus: userOnFocus,
    onmouseenter: userOnMouseEnter,
    onkeydown: userOnKeyDown,
    children: propsChildren,
    ...rest
  } = props;

  if (!menu) {
    throw new SeidrError("MenubarTrigger requires a menu instance coordinator");
  }

  if (!menubar) {
    throw new SeidrError("MenubarTrigger requires a menubarInstance coordinator");
  }

  const value = menuValue ?? menu.id;
  const isHorizontal = menubar.orientation === "horizontal";

  const internalRef = createRef<SeidrElementTagNameMap[T]>();

  internalRef.bind((el) => {
    if (userRef && el && isFn(userRef)) {
      Reflect.apply(userRef, null, [el]);
    }
    if (el) {
      menu.triggerRef(el as unknown as HTMLElement);
    }
  });

  const isCurrentActive: DerivedValue<boolean> = menubar.activeTrigger.as((a) => a === value);
  const isMenuOpen: DerivedValue<boolean> = menu.isOpen;

  const handleClick = (e: MouseEvent) => {
    if (isFn(userOnClick)) {
      Reflect.apply(userOnClick, e.currentTarget, [e]);
    }
    if (e.defaultPrevented) return;

    if (isMenuOpen()) {
      menubar.closeMenu();
    } else {
      menubar.openMenu(value);
    }
  };

  const handleFocus = (e: FocusEvent) => {
    if (isFn(userOnFocus)) {
      Reflect.apply(userOnFocus, e.currentTarget, [e]);
    }
    if (!e.defaultPrevented) {
      menubar.activeTrigger(value);
    }
  };

  const handleMouseEnter = (e: MouseEvent) => {
    if (isFn(userOnMouseEnter)) {
      Reflect.apply(userOnMouseEnter, e.currentTarget, [e]);
    }
    if (e.defaultPrevented) return;

    // Desktop menubar behavior: switch to hovered menu immediately if any menu is currently open
    if (menubar.isOpen() && menubar.value() !== value) {
      menubar.openMenu(value);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (isFn(userOnKeyDown)) {
      Reflect.apply(userOnKeyDown, e.currentTarget, [e]);
    }
    if (e.defaultPrevented) return;

    const openKey = isHorizontal ? "ArrowDown" : "ArrowRight";
    const openLastKey = isHorizontal ? "ArrowUp" : "ArrowLeft";

    if (e.key === openKey) {
      e.preventDefault();
      e.stopPropagation();
      menubar.openMenu(value, true);
      return;
    }

    if (e.key === openLastKey) {
      e.preventDefault();
      e.stopPropagation();
      menubar.openMenu(value, true);
      return;
    }

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
      if (isMenuOpen()) {
        menubar.closeMenu();
      } else {
        menubar.openMenu(value, true);
      }
      return;
    }

    // Let ArrowRight / ArrowLeft / Home / End bubble to MenubarRoot or trigger directly
    if (
      e.key === "ArrowRight" ||
      e.key === "ArrowLeft" ||
      e.key === "ArrowUp" ||
      e.key === "ArrowDown" ||
      e.key === "Home" ||
      e.key === "End"
    ) {
      menubar.handleRootKeyDown(e);
    }
  };

  const isButton = as === "button";

  const resolvedChildren: (SeidrChild | undefined)[] = [];
  if (children) {
    if (Array.isArray(children)) resolvedChildren.push(...children);
    else resolvedChildren.push(children);
  }
  if (propsChildren) {
    if (Array.isArray(propsChildren)) resolvedChildren.push(...propsChildren);
    else resolvedChildren.push(propsChildren);
  }

  return $(
    as,
    {
      id: userId ?? menu.triggerId,
      ref: internalRef,
      type: isButton ? (userType ?? "button") : undefined,
      role: "menuitem",
      tabIndex: isCurrentActive.as((active) => (active ? 0 : -1)),
      "aria-haspopup": "menu",
      "aria-expanded": isMenuOpen.as((o) => (o ? "true" : "false")),
      "aria-controls": isMenuOpen.as((o) => (o ? menu.contentId() : undefined)),
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      "aria-describedby": ariaDescribedBy,
      dataComponent,
      dataPart: DATA_PART_TRIGGER,
      dataExpanded: isMenuOpen.as((o) => (o ? "" : undefined)),
      dataClosed: isMenuOpen.as((o) => (!o ? "" : undefined)),
      dataHighlighted: isCurrentActive.as((a) => (a ? "" : undefined)),
      onclick: handleClick,
      onfocus: handleFocus,
      onmouseenter: handleMouseEnter,
      onkeydown: handleKeyDown,
      ...rest,
    } as SeidrElementProps<T>,
    resolvedChildren,
  );
}
