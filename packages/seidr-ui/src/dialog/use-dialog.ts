import {
  createRef,
  createValue,
  isValue,
  unwrapValue,
  useId,
  wrapValue,
} from "@fimbul-works/seidr";
import type { UseDialogProps, UseDialogResult } from "./types.js";

/**
 * Headless reactive coordinator for Dialog components.
 */
export function useDialog(props: UseDialogProps = {}): UseDialogResult {
  const {
    id: customId,
    defaultOpen = false,
    open: openProp,
    onOpenChange,
    isModal: isModalProp = true,
    closeOnOutsideClick = true,
    closeOnEscapeKeyDown = true,
    preventScroll: preventScrollProp,
    portal = true,
    portalTarget,
  } = props;

  const id = customId ?? useId("dialog");

  const contentId = createValue<string>(`${id}-content`).as((v) => v);
  const titleId = createValue<string>(`${id}-title`).as((v) => v);
  const descriptionId = createValue<string>(`${id}-description`).as((v) => v);

  const triggerRef = createRef<HTMLElement>();
  const overlayRef = createRef<HTMLElement>();
  const contentRef = createRef<HTMLElement>();

  const isModal = wrapValue(isModalProp).as((m) => Boolean(m));
  const preventScroll = wrapValue(preventScrollProp ?? isModalProp).as((p) => Boolean(p));

  const isOpenState = createValue<boolean>(unwrapValue(openProp) ?? defaultOpen);
  if (openProp !== undefined && isValue(openProp)) {
    openProp.watch((val) => {
      isOpenState(val);
    });
  }

  const setOpen = (next: boolean) => {
    if (isOpenState() === next) {
      return;
    }
    if (openProp === undefined || isValue(openProp)) {
      isOpenState(next);
    }
    onOpenChange?.(next);
  };

  const open = () => setOpen(true);
  const close = () => setOpen(false);
  const toggle = () => setOpen(!isOpenState());

  return {
    id,
    isOpen: isOpenState.as((v) => v),
    isModal,
    closeOnOutsideClick,
    preventScroll,
    portal,
    portalTarget,
    contentId,
    titleId,
    descriptionId,
    triggerRef,
    overlayRef,
    contentRef,
    open,
    close,
    toggle,
  };
}

