import {
  createRef,
  createValue,
  getDocument,
  inClient,
  isServer,
  isValue,
  onUnmounted,
  unwrapValue,
  useId,
} from "@fimbul-works/seidr";
import { getEventPoint, getSafePolygon, isPointInPolygon } from "../popper/polygon.js";
import type { Placement } from "../popper/types.js";
import { usePopper } from "../popper/use-popper.js";
import { contains } from "../utils/dom.js";
import type { UseHoverCardOptions, UseHoverCardResult } from "./types.js";

/**
 * Headless reactive coordinator for a HoverCard component.
 */
export function useHoverCard(options: UseHoverCardOptions = {}): UseHoverCardResult {
  const {
    id: customId,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    openDelay = 700,
    closeDelay = 300,
    ignoreSafeArea = false,
    forceMount = false,
    portalTarget,
    placement = "bottom",
    gutter = 8,
    onCurrentPlacementChange,
    ...popperRest
  } = options;

  const id = customId ?? useId("hovercard");

  const triggerRef = createRef<HTMLElement>();
  const contentRef = createRef<HTMLElement>();

  const isOpenState = createValue<boolean>(unwrapValue(openProp) ?? defaultOpen);
  if (openProp !== undefined && isValue(openProp)) {
    openProp.watch((val) => {
      isOpenState(val);
    });
  }

  const setOpen = (next: boolean) => {
    if (isOpenState() === next) return;
    if (openProp === undefined) {
      isOpenState(next);
    } else if (isValue(openProp)) {
      isOpenState(next);
    }
    onOpenChange?.(next);
  };

  const popper = usePopper({
    id: `${id}-popper`,
    anchorRef: triggerRef,
    contentRef,
    placement,
    gutter,
    onCurrentPlacementChange,
    ...popperRest,
  });

  let openTimeoutId: ReturnType<typeof setTimeout> | undefined;
  let closeTimeoutId: ReturnType<typeof setTimeout> | undefined;

  const cancelOpening = () => {
    if (isServer()) return;
    if (openTimeoutId !== undefined) {
      clearTimeout(openTimeoutId);
      openTimeoutId = undefined;
    }
  };

  const cancelClosing = () => {
    if (isServer()) return;
    if (closeTimeoutId !== undefined) {
      clearTimeout(closeTimeoutId);
      closeTimeoutId = undefined;
    }
  };

  const open = () => {
    cancelOpening();
    cancelClosing();
    setOpen(true);
  };

  const close = () => {
    cancelOpening();
    cancelClosing();
    setOpen(false);
  };

  const openWithDelay = () => {
    if (isServer()) return;
    cancelOpening();
    if (openDelay <= 0) {
      setOpen(true);
      return;
    }
    openTimeoutId = setTimeout(() => {
      openTimeoutId = undefined;
      setOpen(true);
    }, openDelay);
  };

  const closeWithDelay = () => {
    if (isServer()) return;
    cancelClosing();
    if (closeDelay <= 0) {
      setOpen(false);
      return;
    }
    closeTimeoutId = setTimeout(() => {
      closeTimeoutId = undefined;
      setOpen(false);
    }, closeDelay);
  };

  const isTargetOnHoverCard = (target: Node | null): boolean => {
    return contains(triggerRef() ?? undefined, target) || contains(contentRef() ?? undefined, target);
  };

  const getPolygonSafeArea = (currentPlacement: Placement) => {
    const triggerEl = triggerRef();
    const contentEl = contentRef();
    if (!triggerEl || !contentEl) return undefined;
    return getSafePolygon(currentPlacement, triggerEl, contentEl);
  };

  const onHoverOutside = (event: PointerEvent) => {
    const target = event.target as Node | null;

    if (isTargetOnHoverCard(target)) {
      cancelClosing();
      return;
    }

    if (!ignoreSafeArea) {
      const polygon = getPolygonSafeArea(popper.currentPlacement());
      if (polygon && isPointInPolygon(getEventPoint(event), polygon)) {
        cancelClosing();
        return;
      }
    }

    if (closeTimeoutId !== undefined) {
      return;
    }

    closeWithDelay();
  };

  inClient(() => {
    let cleanupOpenListeners: (() => void) | undefined;

    isOpenState.bind((isOpen) => {
      cleanupOpenListeners?.();
      cleanupOpenListeners = undefined;

      if (!isOpen) return;

      const doc = getDocument();
      doc.addEventListener("pointermove", onHoverOutside, true);

      cleanupOpenListeners = () => {
        doc.removeEventListener("pointermove", onHoverOutside, true);
      };
    });

    onUnmounted(() => {
      cleanupOpenListeners?.();
      cancelOpening();
      cancelClosing();
    });
  });

  return {
    id,
    isOpen: isOpenState.as((o) => o),
    triggerRef,
    contentRef,
    popper,
    forceMount,
    portalTarget,
    openWithDelay,
    closeWithDelay,
    cancelOpening,
    cancelClosing,
    open,
    close,
    isTargetOnHoverCard,
  };
}

