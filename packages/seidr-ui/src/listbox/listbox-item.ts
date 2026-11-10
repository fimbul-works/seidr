import { isFn, isUndef } from "@fimbul-works/hvat";
import {
  $,
  createRef,
  inClient,
  mergeValues,
  onUnmounted,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_LISTBOX, DATA_PART_ITEM } from "../constants.js";
import { ListboxItemDescription } from "./listbox-item-description.js";
import { ListboxItemIndicator } from "./listbox-item-indicator.js";
import { ListboxItemLabel } from "./listbox-item-label.js";
import type { ListboxItemProps, UseListboxItemResult } from "./types.js";
import { useListboxItem } from "./use-listbox-item.js";

/**
 * An item option within a Listbox widget (`role="option"`).
 */
export function ListboxItem<T extends keyof SeidrElementTagNameMap = "li">(
  props: ListboxItemProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "li" as T,
    instance: explicitInstance,
    listbox,
    value,
    disabled: itemDisabled,
    textValue,
    dataComponent = DATA_COMPONENT_LISTBOX,
    label,
    description,
    indicator,
    ref: userRef,
    onclick: userOnClick,
    onkeydown: userOnKeyDown,
    onfocus: userOnFocus,
    onpointermove: userOnPointerMove,
    onpointerdown: userOnPointerDown,
    onpointerup: userOnPointerUp,
    ariaLabel,
    ariaLabelledBy: userAriaLabelledBy,
    ariaDescribedBy: userAriaDescribedBy,
    ...rest
  } = props;

  let item: UseListboxItemResult;
  if (explicitInstance) {
    item = explicitInstance;
  } else if (listbox) {
    item = useListboxItem(listbox, { value, disabled: itemDisabled, textValue });
  } else {
    throw new SeidrError("ListboxItem requires an instance coordinator or a listbox coordinator");
  }

  let unregister: (() => void) | undefined;
  const itemRef = createRef<SeidrElementTagNameMap[T]>();

  itemRef.bind((el) => {
    if (userRef && el && isFn(userRef)) {
      Reflect.apply(userRef, null, [el]);
    }
    if (el) {
      unregister?.();
      unregister = item.listbox.registerItem({
        value,
        el,
        isItemDisabled: () => item.isDisabled(),
        textValue: () => textValue ?? el.textContent?.trim() ?? value,
      });
    }
  });

  onUnmounted(() => {
    unregister?.();
  });

  let isPointerDown = false;
  let lastSelectedTime = 0;

  const triggerSelection = () => {
    if (item.isDisabled()) return;
    lastSelectedTime = Date.now();
    item.listbox.toggleOrSelect(value);
  };

  const handlePointerDown = (e: PointerEvent) => {
    if (isFn(userOnPointerDown)) {
      Reflect.apply(userOnPointerDown, e.currentTarget, [e]);
    }
    isPointerDown = true;
  };

  const handlePointerUp = (e: PointerEvent) => {
    if (isFn(userOnPointerUp)) {
      Reflect.apply(userOnPointerUp, e.currentTarget, [e]);
    }
    if (isPointerDown && (e.button === 0 || isUndef(e.button))) {
      isPointerDown = false;
      triggerSelection();
    }
  };

  const handleClick = (e: MouseEvent) => {
    if (isFn(userOnClick)) {
      Reflect.apply(userOnClick, e.currentTarget, [e]);
    }
    if (e.defaultPrevented || item.isDisabled()) return;
    if (Date.now() - lastSelectedTime < 60) return;
    triggerSelection();
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (isFn(userOnPointerMove)) {
      Reflect.apply(userOnPointerMove, e.currentTarget, [e]);
    }
    if (e.defaultPrevented || item.isDisabled() || e.pointerType !== "mouse") return;
    if (item.listbox.shouldFocusOnHover) {
      item.listbox.highlightValue(value);
      inClient(() => {
        (e.currentTarget as HTMLElement).focus?.();
      });
    }
  };

  const handleFocus = (e: FocusEvent) => {
    if (isFn(userOnFocus)) {
      Reflect.apply(userOnFocus, e.currentTarget, [e]);
    }
    if (!item.isDisabled()) {
      item.listbox.highlightValue(value);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (isFn(userOnKeyDown)) {
      Reflect.apply(userOnKeyDown, e.currentTarget, [e]);
    }
    if (e.defaultPrevented) return;
    item.listbox.handleItemKeyDown(e, value);
  };

  const ariaSelected =
    item.listbox.selectionMode === "none" ? undefined : item.isSelected.as((s) => (s ? "true" : "false"));

  const ariaDisabled = item.isDisabled.as((d) => (d ? "true" : "false"));

  const ariaLabelledBy = mergeValues(
    () => {
      if (userAriaLabelledBy) return userAriaLabelledBy;
      const registeredId = item.labelId();
      return registeredId || undefined;
    },
    { parents: [item.labelId] },
  );

  const ariaDescribedBy = mergeValues(
    () => {
      if (userAriaDescribedBy) return userAriaDescribedBy;
      const registeredId = item.descriptionId();
      return registeredId || undefined;
    },
    { parents: [item.descriptionId] },
  );

  let itemContent: SeidrChild | SeidrChild[] = children ?? [];
  if (isUndef(children) && (label || description || indicator)) {
    const parts: SeidrChild[] = [];
    if (label) {
      parts.push(ListboxItemLabel({ instance: item }, label));
    }
    if (description) {
      parts.push(ListboxItemDescription({ instance: item }, description));
    }
    if (indicator) {
      parts.push(ListboxItemIndicator({ instance: item }, indicator));
    }
    itemContent = parts;
  }

  return $(
    as,
    {
      ref: itemRef,
      id: item.id,
      role: "option",
      dataComponent,
      dataPart: DATA_PART_ITEM,
      dataKey: value,
      dataSelected: item.isSelected.as((s) => (s ? "" : undefined)),
      dataHighlighted: item.isHighlighted.as((h) => (h ? "" : undefined)),
      dataDisabled: item.isDisabled.as((d) => (d ? "" : undefined)),
      ariaSelected,
      ariaDisabled,
      ariaLabel,
      ariaLabelledby: ariaLabelledBy,
      ariaDescribedby: ariaDescribedBy,
      tabIndex: item.tabIndex,
      onclick: handleClick,
      onpointerdown: handlePointerDown,
      onpointerup: handlePointerUp,
      onpointermove: handlePointerMove,
      onfocus: handleFocus,
      onkeydown: handleKeyDown,
      ...rest,
    } as SeidrElementProps<T>,
    itemContent,
  );
}
