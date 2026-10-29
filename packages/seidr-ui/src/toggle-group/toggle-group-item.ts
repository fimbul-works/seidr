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
import type { ToggleGroupItemProps } from "./types.js";

/**
 * Toggle button item within a ToggleGroup (role="button" or native <button>).
 */
export function ToggleGroupItem<T extends keyof SeidrElementTagNameMap = "button">(
  props: ToggleGroupItemProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "button" as T,
    instance: toggleGroup,
    value,
    disabled: itemDisabledProp,
    dataComponent = "toggle-group",
    ref: userRef,
    onclick: userOnClick,
    onkeydown: userOnKeyDown,
    onfocus: userOnFocus,
    type: userType,
    ...rest
  } = props;

  if (!toggleGroup) {
    throw new SeidrError("ToggleGroupItem requires an instance coordinator");
  }

  if (value === undefined) {
    throw new SeidrError("ToggleGroupItem requires a unique 'value' prop");
  }

  const disabledObservable = wrapValue(itemDisabledProp ?? false);
  const isItemDisabled = () => toggleGroup.isDisabled() || Boolean(disabledObservable());

  const isItemDisabledDerived = mergeValues(() => toggleGroup.isDisabled() || Boolean(disabledObservable()), {
    parents: [toggleGroup.isDisabled, disabledObservable],
  });

  let unregister: (() => void) | undefined;
  const itemRef = createRef<SeidrElementTagNameMap[T]>();

  itemRef.bind((el) => {
    if (userRef && el && isFn(userRef)) {
      Reflect.apply(userRef, null, [el]);
    }
    if (el) {
      unregister?.();
      unregister = toggleGroup.registerItem(value, el, isItemDisabled);
    }
  });

  onUnmounted(() => {
    unregister?.();
  });

  const handleClick = (e: MouseEvent) => {
    if (isFn(userOnClick)) {
      Reflect.apply(userOnClick, e.currentTarget, [e]);
    }
    if (e.defaultPrevented || isItemDisabled()) return;
    toggleGroup.toggle(value);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (isFn(userOnKeyDown)) {
      Reflect.apply(userOnKeyDown, e.currentTarget, [e]);
    }
    if (e.defaultPrevented) return;
    toggleGroup.handleItemKeyDown(e, value);
  };

  const handleFocus = (e: FocusEvent) => {
    if (isFn(userOnFocus)) {
      Reflect.apply(userOnFocus, e.currentTarget, [e]);
    }
    if (!isItemDisabled()) {
      toggleGroup.focusedKey(value);
    }
  };

  const isPressed = toggleGroup.isSelected(value);
  const tabIndex = toggleGroup.getItemTabIndex(value, isItemDisabled);

  return $(
    as as T,
    {
      ref: itemRef,
      type: as === "button" ? (userType ?? "button") : undefined,
      dataComponent,
      dataPart: "item",
      dataOrientation: toggleGroup.orientation,
      dataDisabled: isItemDisabledDerived.as((d) => (d ? "" : undefined)),
      disabled: as === "button" ? isItemDisabledDerived.as((d) => (d ? true : undefined)) : undefined,
      ariaPressed: isPressed.as((p) => (p ? "true" : "false")),
      dataPressed: isPressed.as((p) => (p ? "" : undefined)),
      tabIndex,
      onclick: handleClick,
      onkeydown: handleKeyDown,
      onfocus: handleFocus,
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
