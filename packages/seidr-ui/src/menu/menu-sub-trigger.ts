import { isFn } from "@fimbul-works/hvat";
import {
  $,
  createRef,
  onUnmounted,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
  useId,
  wrapValue,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_MENU, DATA_PART_SUB_TRIGGER } from "../constants.js";
import type { MenuSubTriggerProps } from "./types.js";

/**
 * An item within a Menu that triggers opening a nested submenu (role="menuitem").
 */
export function MenuSubTrigger<T extends keyof SeidrElementTagNameMap = "div">(
  props: MenuSubTriggerProps<T> = {} as MenuSubTriggerProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "div" as T,
    instance: menu,
    subInstance,
    dataComponent = DATA_COMPONENT_MENU,
    value: userValue,
    disabled: itemDisabledProp,
    textValue,
    ref: userRef,
    onclick: userOnClick,
    onpointermove: userOnPointerMove,
    children: propsChildren,
    ...rest
  } = props;

  if (!menu) {
    throw new SeidrError("MenuSubTrigger requires an outer menu instance coordinator");
  }

  if (!subInstance) {
    throw new SeidrError("MenuSubTrigger requires a subInstance coordinator");
  }

  const value = userValue ?? useId("menu-sub-trigger");
  const disabledObservable = wrapValue(itemDisabledProp ?? false);

  const isHighlighted = menu.highlightedValue.as((h) => h === value);
  const isDisabled = disabledObservable.as((d) => Boolean(d));

  const triggerRef = createRef<SeidrElementTagNameMap[T]>();

  triggerRef.bind((el) => {
    if (userRef && el && isFn(userRef)) {
      Reflect.apply(userRef, null, [el]);
    }
    subInstance.triggerRef(el as unknown as HTMLElement);
  });

  const openSubmenu = () => {
    if (disabledObservable()) return;
    subInstance.open();
  };

  onUnmounted(
    menu.registerItem({
      value,
      getElement: () => triggerRef() as HTMLElement | null,
      isDisabled: () => Boolean(disabledObservable()),
      getTextValue: () => textValue ?? triggerRef()?.textContent ?? "",
      isSubmenuTrigger: true,
      openSubmenu,
    }),
  );

  const handleClick = (e: MouseEvent) => {
    if (isFn(userOnClick)) {
      Reflect.apply(userOnClick, e.currentTarget, [e]);
    }
    if (!e.defaultPrevented && !disabledObservable()) {
      subInstance.toggle();
    }
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (isFn(userOnPointerMove)) {
      Reflect.apply(userOnPointerMove, e.currentTarget, [e]);
    }
    if (!e.defaultPrevented && !disabledObservable()) {
      menu.highlightItem(value);
      subInstance.open();
    }
  };

  return $(
    as,
    {
      ref: triggerRef,
      role: "menuitem",
      tabIndex: -1,
      "aria-haspopup": "menu",
      "aria-expanded": subInstance.isOpen.as((o) => (o ? "true" : "false")),
      "aria-controls": subInstance.isOpen.as((o) => (o ? subInstance.contentId() : undefined)),
      "aria-disabled": isDisabled.as((d) => (d ? "true" : undefined)),
      dataComponent,
      dataPart: DATA_PART_SUB_TRIGGER,
      dataHighlighted: isHighlighted.as((h) => (h ? "" : undefined)),
      dataDisabled: isDisabled.as((d) => (d ? "" : undefined)),
      dataExpanded: subInstance.isOpen.as((o) => (o ? "" : undefined)),
      onclick: handleClick,
      onpointermove: handlePointerMove,
      ...rest,
    } as SeidrElementProps<T>,
    [children, propsChildren],
  );
}
