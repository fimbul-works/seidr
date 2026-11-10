import { isFn } from "@fimbul-works/hvat";
import {
  $,
  createRef,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_SELECT, DATA_PART_TRIGGER } from "../constants.js";
import type { SelectTriggerProps } from "./types.js";

/**
 * Trigger activator button element for a Select dropdown.
 */
export function SelectTrigger<T extends keyof SeidrElementTagNameMap = "button">(
  props: SelectTriggerProps<T> = {} as SelectTriggerProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "button" as T,
    instance: select,
    dataComponent = DATA_COMPONENT_SELECT,
    id: userId,
    ref: userRef,
    ariaLabel,
    ariaLabelledBy,
    ariaDescribedBy,
    onkeydown: userOnKeyDown,
    onpointerdown: userOnPointerDown,
    onclick: userOnClick,
    ...rest
  } = props;

  if (!select) {
    throw new SeidrError("SelectTrigger requires an instance coordinator");
  }

  const internalRef = createRef<SeidrElementTagNameMap[T]>();

  internalRef.bind((el) => {
    if (userRef && el && isFn(userRef)) {
      Reflect.apply(userRef, null, [el]);
    }
    select.triggerRef(el as unknown as HTMLElement);
  });

  const handleKeyDown = (e: KeyboardEvent) => {
    if (typeof userOnKeyDown === "function") {
      Reflect.apply(userOnKeyDown, e.currentTarget, [e]);
    }
    if (!e.defaultPrevented) {
      select.handleTriggerKeyDown(e);
    }
  };

  const handlePointerDown = (e: PointerEvent) => {
    if (typeof userOnPointerDown === "function") {
      Reflect.apply(userOnPointerDown, e.currentTarget, [e]);
    }
    if (!e.defaultPrevented) {
      select.handleTriggerPointerDown(e);
    }
  };

  const handleClick = (e: MouseEvent) => {
    if (typeof userOnClick === "function") {
      Reflect.apply(userOnClick, e.currentTarget, [e]);
    }
    if (!e.defaultPrevented) {
      select.handleTriggerClick(e);
    }
  };

  const isButton = as === "button";

  return $(
    as,
    {
      ref: internalRef,
      id: userId ?? select.triggerId,
      type: isButton ? "button" : undefined,
      disabled: select.isDisabled,
      dataComponent,
      dataPart: DATA_PART_TRIGGER,
      ariaHaspopup: "listbox",
      ariaExpanded: select.isOpen.as((o) => (o ? "true" : "false")),
      ariaControls: select.listboxId,
      ariaLabel,
      ariaLabelledby: ariaLabelledBy ?? (ariaLabel ? undefined : select.ariaLabelledBy),
      ariaDescribedby: ariaDescribedBy,
      dataExpanded: select.isOpen.as((o) => (o ? "" : undefined)),
      dataClosed: select.isOpen.as((o) => (!o ? "" : undefined)),
      dataDisabled: select.isDisabled.as((d) => (d ? "" : undefined)),
      onkeydown: handleKeyDown,
      onpointerdown: handlePointerDown,
      onclick: handleClick,
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
