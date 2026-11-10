import { isFn } from "@fimbul-works/hvat";
import {
  $,
  createRef,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_COMBOBOX, DATA_PART_TRIGGER } from "../constants.js";
import type { ComboboxTriggerProps } from "./types.js";

/**
 * Trigger button that manually toggles the combobox dropdown menu.
 */
export function ComboboxTrigger<T extends keyof SeidrElementTagNameMap = "button">(
  props: ComboboxTriggerProps<T> = {} as ComboboxTriggerProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "button" as T,
    instance: combobox,
    dataComponent = DATA_COMPONENT_COMBOBOX,
    id: userId,
    ref: userRef,
    ariaLabel,
    onpointerdown: userOnPointerDown,
    onclick: userOnClick,
    ...rest
  } = props;

  if (!combobox) {
    throw new SeidrError("ComboboxTrigger requires an instance coordinator");
  }

  const internalRef = createRef<SeidrElementTagNameMap[T]>();

  internalRef.bind((el) => {
    if (userRef && el && isFn(userRef)) {
      Reflect.apply(userRef, null, [el]);
    }
    combobox.triggerRef(el as unknown as HTMLElement);
  });

  const handlePointerDown = (e: PointerEvent) => {
    if (typeof userOnPointerDown === "function") {
      Reflect.apply(userOnPointerDown, e.currentTarget, [e]);
    }
    if (!e.defaultPrevented) {
      combobox.handleTriggerPointerDown(e);
    }
  };

  const handleClick = (e: MouseEvent) => {
    if (typeof userOnClick === "function") {
      Reflect.apply(userOnClick, e.currentTarget, [e]);
    }
    if (!e.defaultPrevented) {
      combobox.handleTriggerClick(e);
    }
  };

  const isButton = as === "button";

  return $(
    as,
    {
      ref: internalRef,
      id: userId ?? combobox.triggerId,
      type: isButton ? "button" : undefined,
      tabindex: -1,
      ariaLabel,
      ariaHaspopup: "listbox",
      ariaExpanded: combobox.isOpen.as((o) => (o ? "true" : "false")),
      ariaControls: combobox.isOpen.as((o) => (o ? combobox.listboxId : undefined)),
      ariaLabelledby: `${combobox.labelId} ${combobox.triggerId}`,
      disabled: combobox.isDisabled,
      dataComponent,
      dataPart: DATA_PART_TRIGGER,
      dataExpanded: combobox.isOpen.as((o) => (o ? "" : undefined)),
      dataClosed: combobox.isOpen.as((o) => (!o ? "" : undefined)),
      dataDisabled: combobox.isDisabled.as((d) => (d ? "" : undefined)),
      onpointerdown: handlePointerDown,
      onclick: handleClick,
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
