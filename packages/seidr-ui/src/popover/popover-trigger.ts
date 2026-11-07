import { isFn } from "@fimbul-works/hvat";
import {
  $,
  createRef,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
  wrapValue,
} from "@fimbul-works/seidr";
import type { PopoverTriggerProps } from "./types.js";

/**
 * Trigger element that opens/toggles the popover when clicked.
 */
export function PopoverTrigger<T extends keyof SeidrElementTagNameMap = "button">(
  props: PopoverTriggerProps<T> = {} as PopoverTriggerProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "button" as T,
    instance: popover,
    dataComponent = "popover",
    type,
    disabled: triggerDisabledProp,
    ariaLabel,
    ariaLabelledBy,
    ref: userRef,
    onclick: userOnClick,
    onpointerdown: userOnPointerDown,
    ...rest
  } = props;

  if (!popover) {
    throw new SeidrError("PopoverTrigger requires an instance coordinator");
  }

  const internalRef = createRef<SeidrElementTagNameMap[T]>();

  internalRef.bind((el) => {
    if (userRef && el && isFn(userRef)) {
      Reflect.apply(userRef, null, [el]);
    }
    popover.triggerRef(el as unknown as HTMLElement);
  });

  const isTriggerDisabled = wrapValue(triggerDisabledProp ?? false).as((d) => Boolean(d));

  const handleClick = (e: MouseEvent) => {
    if (isFn(userOnClick)) {
      Reflect.apply(userOnClick, e.currentTarget, [e]);
    }
    if (isTriggerDisabled() || e.defaultPrevented) return;
    popover.toggle();
  };

  const handlePointerDown = (e: PointerEvent) => {
    if (isFn(userOnPointerDown)) {
      Reflect.apply(userOnPointerDown, e.currentTarget, [e]);
    }
    // Prevent double toggle when trigger is inside an existing overlay/safari focus sequence
    e.preventDefault();
  };

  const computedAriaControls = popover.isOpen.as((open) => (open ? popover.contentId() : undefined));

  return $(
    as,
    {
      ref: internalRef,
      type: as === "button" ? (type ?? "button") : type,
      disabled: as === "button" ? isTriggerDisabled : undefined,
      "aria-haspopup": "dialog",
      "aria-expanded": popover.isOpen.as((o) => String(o)),
      "aria-controls": computedAriaControls,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      dataComponent,
      dataPart: "trigger",
      dataExpanded: popover.isOpen.as((o) => (o ? "" : undefined)),
      dataClosed: popover.isOpen.as((o) => (!o ? "" : undefined)),
      dataDisabled: isTriggerDisabled.as((d) => (d ? "" : undefined)),
      onclick: handleClick,
      onpointerdown: handlePointerDown,
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}

