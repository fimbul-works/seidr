import { isFn } from "@fimbul-works/hvat";
import {
  $,
  createRef,
  onUnmounted,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
  wrapValue,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_HOVER_CARD, DATA_PART_TRIGGER } from "../constants.js";
import type { HoverCardTriggerProps } from "./types.js";

/**
 * Trigger link or element that opens a HoverCard when hovered or focused.
 */
export function HoverCardTrigger<T extends keyof SeidrElementTagNameMap = "a">(
  props: HoverCardTriggerProps<T> = {} as HoverCardTriggerProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "a" as T,
    instance: hoverCard,
    dataComponent = DATA_COMPONENT_HOVER_CARD,
    href,
    target,
    rel,
    disabled: disabledProp,
    ariaLabel,
    ariaLabelledBy,
    ariaDescribedBy,
    ref: userRef,
    onpointerenter: userOnPointerEnter,
    onpointerleave: userOnPointerLeave,
    onfocus: userOnFocus,
    onblur: userOnBlur,
    ...rest
  } = props;

  if (!hoverCard) {
    throw new SeidrError("HoverCardTrigger requires an instance coordinator");
  }

  const internalRef = createRef<SeidrElementTagNameMap[T]>();

  internalRef.bind((el) => {
    if (userRef && el && isFn(userRef)) {
      Reflect.apply(userRef, null, [el]);
    }
    hoverCard.triggerRef(el as unknown as HTMLElement);
  });

  const isDisabled = wrapValue(disabledProp ?? false).as((d) => Boolean(d));

  const handlePointerEnter = (e: PointerEvent) => {
    if (isFn(userOnPointerEnter)) {
      Reflect.apply(userOnPointerEnter, e.currentTarget, [e]);
    }

    if (e.pointerType === "touch" || isDisabled() || e.defaultPrevented) {
      return;
    }

    hoverCard.cancelClosing();

    if (!hoverCard.isOpen()) {
      hoverCard.openWithDelay();
    }
  };

  const handlePointerLeave = (e: PointerEvent) => {
    if (isFn(userOnPointerLeave)) {
      Reflect.apply(userOnPointerLeave, e.currentTarget, [e]);
    }

    if (e.pointerType === "touch") {
      return;
    }

    hoverCard.cancelOpening();
  };

  const handleFocus = (e: FocusEvent) => {
    if (isFn(userOnFocus)) {
      Reflect.apply(userOnFocus, e.currentTarget, [e]);
    }

    if (isDisabled() || e.defaultPrevented) {
      return;
    }

    hoverCard.cancelClosing();

    if (!hoverCard.isOpen()) {
      hoverCard.openWithDelay();
    }
  };

  const handleBlur = (e: FocusEvent) => {
    if (isFn(userOnBlur)) {
      Reflect.apply(userOnBlur, e.currentTarget, [e]);
    }

    hoverCard.cancelOpening();

    const relatedTarget = e.relatedTarget as Node | null;
    if (hoverCard.isTargetOnHoverCard(relatedTarget)) {
      return;
    }

    hoverCard.closeWithDelay();
  };

  onUnmounted(() => {
    hoverCard.cancelOpening();
  });

  return $(
    as,
    {
      ref: internalRef,
      role: isDisabled.as((d) => (as !== "a" || d ? "link" : undefined)),
      tabIndex: isDisabled.as((d) => (as !== "a" && !d ? 0 : undefined)),
      href: isDisabled.as((d) => (!d ? href : undefined)),
      target,
      rel,
      "aria-disabled": isDisabled.as((d) => (d ? "true" : undefined)),
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      "aria-describedby": ariaDescribedBy,
      dataComponent,
      dataPart: DATA_PART_TRIGGER,
      dataExpanded: hoverCard.isOpen.as((o) => (o ? "" : undefined)),
      dataClosed: hoverCard.isOpen.as((o) => (!o ? "" : undefined)),
      dataDisabled: isDisabled.as((d) => (d ? "" : undefined)),
      onpointerenter: handlePointerEnter,
      onpointerleave: handlePointerLeave,
      onfocus: handleFocus,
      onblur: handleBlur,
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
