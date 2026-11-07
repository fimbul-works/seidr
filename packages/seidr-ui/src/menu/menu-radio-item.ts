import { isFn } from "@fimbul-works/hvat";
import {
  $,
  createRef,
  mergeValues,
  onUnmounted,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
  wrapValue,
} from "@fimbul-works/seidr";
import type { MenuRadioItemProps } from "./types.js";

/**
 * Radio selection item within a Menu radio group (role="menuitemradio").
 */
export function MenuRadioItem<T extends keyof SeidrElementTagNameMap = "div">(
  props: MenuRadioItemProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "div" as T,
    instance: menu,
    dataComponent = "menu",
    value,
    radioGroupInstance,
    disabled: itemDisabledProp,
    closeOnSelect = false,
    onSelect,
    ref: userRef,
    onclick: userOnClick,
    onpointermove: userOnPointerMove,
    ...rest
  } = props;

  if (!menu) {
    throw new SeidrError("MenuRadioItem requires a menu instance coordinator");
  }

  if (!radioGroupInstance) {
    throw new SeidrError("MenuRadioItem requires a radioGroupInstance coordinator");
  }

  if (value === undefined) {
    throw new SeidrError("MenuRadioItem requires a unique 'value' prop");
  }

  const disabledObservable = wrapValue(itemDisabledProp ?? false);
  const isDisabled = mergeValues(
    () => Boolean(radioGroupInstance.isDisabled() || disabledObservable()),
    { parents: [radioGroupInstance.isDisabled, disabledObservable] },
  );

  const isSelected = radioGroupInstance.isSelected(value);
  const isHighlighted = menu.highlightedValue.as((h) => h === value);

  const itemRef = createRef<SeidrElementTagNameMap[T]>();

  itemRef.bind((el) => {
    if (userRef && el && isFn(userRef)) {
      Reflect.apply(userRef, null, [el]);
    }
  });

  const select = () => {
    if (isDisabled()) return;
    radioGroupInstance.setSelectedValue(value);
    onSelect?.();
    if (closeOnSelect) {
      menu.rootMenu.close(true);
    }
  };

  onUnmounted(
    menu.registerItem({
      value,
      getElement: () => itemRef() as HTMLElement | null,
      isDisabled: () => isDisabled(),
      getTextValue: () => itemRef()?.textContent ?? "",
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
    if (!e.defaultPrevented && !isDisabled()) {
      menu.highlightItem(value);
    }
  };

  return $(
    as,
    {
      ref: itemRef,
      role: "menuitemradio",
      tabIndex: -1,
      "aria-checked": isSelected.as((s) => (s ? "true" : "false")),
      "aria-disabled": isDisabled.as((d) => (d ? "true" : undefined)),
      dataComponent,
      dataPart: "radio-item",
      dataValue: value,
      dataHighlighted: isHighlighted.as((h) => (h ? "" : undefined)),
      dataDisabled: isDisabled.as((d) => (d ? "" : undefined)),
      dataChecked: isSelected.as((s) => (s ? "" : undefined)),
      onclick: handleClick,
      onpointermove: handlePointerMove,
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}

