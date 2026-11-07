import { isFn } from "@fimbul-works/hvat";
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
  wrapValue,
} from "@fimbul-works/seidr";
import { getOwnerDocument } from "../utils/dom.js";
import type { TooltipTriggerProps } from "./types.js";

/**
 * Trigger element that opens a Tooltip when hovered or focused.
 */
export function TooltipTrigger<T extends keyof SeidrElementTagNameMap = "button">(
  props: TooltipTriggerProps<T> = {} as TooltipTriggerProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "button" as T,
    instance: tooltip,
    dataComponent = "tooltip",
    type,
    disabled: triggerDisabledProp,
    ariaLabel,
    ariaLabelledBy,
    ariaDescribedBy,
    ref: userRef,
    onpointerenter: userOnPointerEnter,
    onpointerleave: userOnPointerLeave,
    onpointerdown: userOnPointerDown,
    onclick: userOnClick,
    onfocus: userOnFocus,
    onblur: userOnBlur,
    ...rest
  } = props;

  if (!tooltip) {
    throw new SeidrError("TooltipTrigger requires an instance coordinator");
  }

  const internalRef = createRef<SeidrElementTagNameMap[T]>();

  internalRef.bind((el) => {
    if (userRef && el && isFn(userRef)) {
      Reflect.apply(userRef, null, [el]);
    }
    tooltip.triggerRef(el as unknown as HTMLElement);
  });

  const triggerDisabled = wrapValue(triggerDisabledProp ?? false);
  const isTriggerDisabled = mergeValues(
    () => Boolean(triggerDisabled()) || tooltip.isDisabled(),
    { parents: [triggerDisabled, tooltip.isDisabled] },
  );

  let isPointerDown = false;
  let isHovered = false;
  let isFocused = false;

  const handlePointerUp = () => {
    isPointerDown = false;
  };

  const handleShow = () => {
    if (!tooltip.isOpen() && (isHovered || isFocused)) {
      tooltip.openTooltip(isFocused);
    }
  };

  const handleHide = (immediate?: boolean) => {
    if (tooltip.isOpen() && !isHovered && !isFocused) {
      tooltip.hideTooltip(immediate);
    }
  };

  const handlePointerEnter = (e: PointerEvent) => {
    if (isFn(userOnPointerEnter)) {
      Reflect.apply(userOnPointerEnter, e.currentTarget, [e]);
    }

    if (
      e.pointerType === "touch" ||
      tooltip.triggerOnFocusOnly() ||
      isTriggerDisabled() ||
      e.defaultPrevented
    ) {
      return;
    }

    isHovered = true;
    handleShow();
  };

  const handlePointerLeave = (e: PointerEvent) => {
    if (isFn(userOnPointerLeave)) {
      Reflect.apply(userOnPointerLeave, e.currentTarget, [e]);
    }

    if (e.pointerType === "touch") {
      return;
    }

    isHovered = false;
    isFocused = false;

    if (tooltip.isOpen()) {
      handleHide();
    } else {
      tooltip.cancelOpening();
    }
  };

  const handlePointerDown = (e: PointerEvent) => {
    if (isFn(userOnPointerDown)) {
      Reflect.apply(userOnPointerDown, e.currentTarget, [e]);
    }

    isPointerDown = true;
    const doc = getOwnerDocument(internalRef());
    doc.addEventListener("pointerup", handlePointerUp, { once: true });
  };

  const handleClick = (e: MouseEvent) => {
    if (isFn(userOnClick)) {
      Reflect.apply(userOnClick, e.currentTarget, [e]);
    }

    isHovered = false;
    isFocused = false;
    handleHide(true);
  };

  const handleFocus = (e: FocusEvent) => {
    if (isFn(userOnFocus)) {
      Reflect.apply(userOnFocus, e.currentTarget, [e]);
    }

    if (isTriggerDisabled() || e.defaultPrevented || isPointerDown) {
      return;
    }

    isFocused = true;
    handleShow();
  };

  const handleBlur = (e: FocusEvent) => {
    if (isFn(userOnBlur)) {
      Reflect.apply(userOnBlur, e.currentTarget, [e]);
    }

    const relatedTarget = e.relatedTarget as Node | null;
    if (tooltip.isTargetOnTooltip(relatedTarget)) {
      return;
    }

    isHovered = false;
    isFocused = false;
    handleHide(true);
  };

  inClient(() => {
    onUnmounted(() => {
      const doc = getOwnerDocument(internalRef());
      doc.removeEventListener("pointerup", handlePointerUp);
    });
  });

  const computedDescribedBy = mergeValues(
    () => {
      const openDesc = tooltip.isOpen() ? tooltip.contentId() : undefined;
      if (ariaDescribedBy && openDesc) return `${ariaDescribedBy} ${openDesc}`;
      return ariaDescribedBy ?? openDesc;
    },
    { parents: [tooltip.isOpen, tooltip.contentId] },
  );

  return $(
    as,
    {
      ref: internalRef,
      type: as === "button" ? (type ?? "button") : type,
      disabled: as === "button" ? isTriggerDisabled : undefined,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      "aria-describedby": computedDescribedBy,
      dataComponent,
      dataPart: "trigger",
      dataExpanded: tooltip.isOpen.as((o) => (o ? "" : undefined)),
      dataClosed: tooltip.isOpen.as((o) => (!o ? "" : undefined)),
      dataDisabled: isTriggerDisabled.as((d) => (d ? "" : undefined)),
      onpointerenter: handlePointerEnter,
      onpointerleave: handlePointerLeave,
      onpointerdown: handlePointerDown,
      onclick: handleClick,
      onfocus: handleFocus,
      onblur: handleBlur,
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}

