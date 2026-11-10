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
import { DATA_COMPONENT_MENU, DATA_PART_ITEM } from "../constants.js";
import type { MenuItemProps } from "./types.js";

/**
 * Standard selectable item within a Menu dropdown (role="menuitem").
 */
export function MenuItem<T extends keyof SeidrElementTagNameMap = "div">(
  props: MenuItemProps<T> = {} as MenuItemProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "div" as T,
    instance: menu,
    dataComponent = DATA_COMPONENT_MENU,
    value: userValue,
    disabled: itemDisabledProp,
    textValue,
    closeOnSelect = true,
    onSelect,
    ref: userRef,
    onclick: userOnClick,
    onpointermove: userOnPointerMove,
    children: propsChildren,
    ...rest
  } = props;

  if (!menu) {
    throw new SeidrError("MenuItem requires an instance coordinator");
  }

  const value = userValue ?? useId("menu-item");
  const disabledObservable = wrapValue(itemDisabledProp ?? false);

  const isHighlighted = menu.highlightedValue.as((h) => h === value);
  const isDisabled = disabledObservable.as((d) => Boolean(d));

  const itemRef = createRef<SeidrElementTagNameMap[T]>();

  itemRef.bind((el) => {
    if (userRef && el && isFn(userRef)) {
      Reflect.apply(userRef, null, [el]);
    }
  });

  const select = () => {
    if (disabledObservable()) return;
    onSelect?.();
    if (closeOnSelect) {
      menu.rootMenu.close(true);
    }
  };

  onUnmounted(
    menu.registerItem({
      value,
      getElement: () => itemRef() as HTMLElement | null,
      isDisabled: () => Boolean(disabledObservable()),
      getTextValue: () => textValue ?? itemRef()?.textContent ?? "",
      select,
    }),
  );

  const handleClick = (e: MouseEvent) => {
    if (isFn(userOnClick)) {
      Reflect.apply(userOnClick, e.currentTarget, [e]);
    }
    if (!e.defaultPrevented) {
      select();
    }
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (isFn(userOnPointerMove)) {
      Reflect.apply(userOnPointerMove, e.currentTarget, [e]);
    }
    if (!e.defaultPrevented && !disabledObservable()) {
      menu.highlightItem(value);
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

  return $(
    as,
    {
      ref: itemRef,
      role: "menuitem",
      tabIndex: -1,
      "aria-disabled": isDisabled.as((d) => (d ? "true" : undefined)),
      dataComponent,
      dataPart: DATA_PART_ITEM,
      dataValue: value,
      dataHighlighted: isHighlighted.as((h) => (h ? "" : undefined)),
      dataDisabled: isDisabled.as((d) => (d ? "" : undefined)),
      onclick: handleClick,
      onpointermove: handlePointerMove,
      ...rest,
    } as SeidrElementProps<T>,
    resolvedChildren,
  );
}
