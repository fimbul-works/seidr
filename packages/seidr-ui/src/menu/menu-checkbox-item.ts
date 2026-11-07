import { isFn } from "@fimbul-works/hvat";
import {
  $,
  createRef,
  createValue,
  onUnmounted,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
  useId,
  type Value,
  wrapValue,
} from "@fimbul-works/seidr";
import type { MenuCheckboxItemProps } from "./types.js";

/**
 * Checkbox toggle item within a Menu dropdown (role="menuitemcheckbox").
 */
export function MenuCheckboxItem<T extends keyof SeidrElementTagNameMap = "div">(
  props: MenuCheckboxItemProps<T> = {} as MenuCheckboxItemProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "div" as T,
    instance: menu,
    dataComponent = "menu",
    value: userValue,
    checked: controlledChecked,
    defaultChecked = false,
    onChange,
    disabled: itemDisabledProp,
    closeOnSelect = false,
    onSelect,
    ref: userRef,
    onclick: userOnClick,
    onpointermove: userOnPointerMove,
    ...rest
  } = props;

  if (!menu) {
    throw new SeidrError("MenuCheckboxItem requires an instance coordinator");
  }

  const value = userValue ?? useId("menu-checkbox");
  const disabledObservable = wrapValue(itemDisabledProp ?? false);

  const checkedState: Value<boolean | "mixed"> = controlledChecked
    ? (wrapValue(controlledChecked) as Value<boolean | "mixed">)
    : createValue<boolean | "mixed">(defaultChecked);

  const isHighlighted = menu.highlightedValue.as((h) => h === value);
  const isDisabled = disabledObservable.as((d) => Boolean(d));

  const isChecked = checkedState.as((c) => Boolean(c));
  const isIndeterminate = checkedState.as((c) => c === "mixed");
  const ariaChecked = checkedState.as((c) => (c === "mixed" ? "mixed" : c ? "true" : "false"));

  const itemRef = createRef<SeidrElementTagNameMap[T]>();

  itemRef.bind((el) => {
    if (userRef && el && isFn(userRef)) {
      Reflect.apply(userRef, null, [el]);
    }
  });

  const select = () => {
    if (disabledObservable()) return;
    const current = checkedState();
    const next = current === "mixed" ? true : !current;
    checkedState(next);
    onChange?.(next);
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
    if (!e.defaultPrevented && !disabledObservable()) {
      menu.highlightItem(value);
    }
  };

  return $(
    as,
    {
      ref: itemRef,
      role: "menuitemcheckbox",
      tabIndex: -1,
      "aria-checked": ariaChecked,
      "aria-disabled": isDisabled.as((d) => (d ? "true" : undefined)),
      dataComponent,
      dataPart: "checkbox-item",
      dataValue: value,
      dataHighlighted: isHighlighted.as((h) => (h ? "" : undefined)),
      dataDisabled: isDisabled.as((d) => (d ? "" : undefined)),
      dataChecked: isChecked.as((c) => (c ? "" : undefined)),
      dataIndeterminate: isIndeterminate.as((i) => (i ? "" : undefined)),
      onclick: handleClick,
      onpointermove: handlePointerMove,
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}

