import { isFn } from "@fimbul-works/hvat";
import {
  createRef,
  createValue,
  isRef,
  isValue,
  unwrapValue,
  useId,
  wrapValue,
} from "@fimbul-works/seidr";
import { usePopper } from "../popper/use-popper.js";
import type { UsePopoverOptions, UsePopoverResult } from "./types.js";

/**
 * Headless reactive coordinator for Popover components.
 */
export function usePopover(options: UsePopoverOptions = {}): UsePopoverResult {
  const {
    id: customId,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    modal = false,
    preventScroll: userPreventScroll,
    forceMount = false,
    portalTarget,
    anchorRef: userAnchorRef,
    placement = "bottom",
    gutter = 8,
    ...popperRest
  } = options;

  const id = customId ?? useId("popover");

  const contentId = createValue<string>(`${id}-content`);
  const titleId = createValue<string>(`${id}-title`);
  const descriptionId = createValue<string>(`${id}-description`);

  const triggerRef = createRef<HTMLElement>();
  const anchorRef = createRef<HTMLElement>();
  const contentRef = createRef<HTMLElement>();

  const isModal = wrapValue(modal);
  const preventScroll = userPreventScroll ?? Boolean(unwrapValue(isModal));

  const isOpenState = createValue<boolean>(unwrapValue(openProp) ?? defaultOpen);
  if (openProp !== undefined && isValue(openProp)) {
    openProp.watch((val) => {
      isOpenState(val);
    });
  }

  const setOpen = (next: boolean) => {
    if (isOpenState() === next) return;
    if (openProp === undefined || isValue(openProp)) {
      isOpenState(next);
    }
    onOpenChange?.(next);
  };

  const open = () => setOpen(true);
  const close = () => setOpen(false);
  const toggle = () => setOpen(!isOpenState());

  const resolveAnchor = (): HTMLElement | undefined => {
    if (isRef(userAnchorRef)) {
      const el = userAnchorRef();
      if (el) return el;
    } else if (isFn(userAnchorRef)) {
      const el = userAnchorRef();
      if (el) return el;
    }
    return anchorRef() ?? triggerRef() ?? undefined;
  };

  const popper = usePopper({
    id: `${id}-popper`,
    anchorRef: resolveAnchor,
    contentRef,
    placement,
    gutter,
    ...popperRest,
  });

  return {
    id,
    contentId,
    titleId,
    descriptionId,
    isOpen: isOpenState.as((o) => o),
    isModal,
    preventScroll,
    triggerRef,
    anchorRef,
    contentRef,
    popper,
    forceMount,
    portalTarget,
    open,
    close,
    toggle,
  };
}

