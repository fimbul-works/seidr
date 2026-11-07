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
  wrapValue,
} from "@fimbul-works/seidr";
import { getEventPoint, getSafePolygon, isPointInPolygon } from "../popper/polygon.js";
import type { Placement } from "../popper/types.js";
import { usePopper } from "../popper/use-popper.js";
import { contains, getOwnerWindow } from "../utils/dom.js";
import type { UseTooltipOptions, UseTooltipResult } from "./types.js";

const activeTooltips = new Map<string, (immediate?: boolean) => void>();
let tooltipsCounter = 0;
let globalWarmedUp = false;
let globalWarmUpTimeout: ReturnType<typeof setTimeout> | undefined;
let globalCoolDownTimeout: ReturnType<typeof setTimeout> | undefined;
let globalSkipDelayTimeout: ReturnType<typeof setTimeout> | undefined;

/**
 * Resets global tooltip warmup/cooldown timers (useful in unit tests).
 */
export function resetTooltipGlobalState(): void {
  activeTooltips.clear();
  globalWarmedUp = false;
  if (globalWarmUpTimeout !== undefined) {
    clearTimeout(globalWarmUpTimeout);
    globalWarmUpTimeout = undefined;
  }
  if (globalCoolDownTimeout !== undefined) {
    clearTimeout(globalCoolDownTimeout);
    globalCoolDownTimeout = undefined;
  }
  if (globalSkipDelayTimeout !== undefined) {
    clearTimeout(globalSkipDelayTimeout);
    globalSkipDelayTimeout = undefined;
  }
}

/**
 * Headless reactive coordinator for a Tooltip component.
 */
export function useTooltip(options: UseTooltipOptions = {}): UseTooltipResult {
  const {
    id: customId,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    disabled = false,
    triggerOnFocusOnly: triggerOnFocusOnlyProp = false,
    openDelay = 700,
    closeDelay = 300,
    skipDelayDuration = 300,
    ignoreSafeArea = false,
    forceMount = false,
    portalTarget,
    placement = "top",
    gutter = 8,
    onCurrentPlacementChange,
    ...popperRest
  } = options;

  const id = customId ?? useId("tooltip");
  const tooltipInternalKey = `${++tooltipsCounter}`;
  const contentId = createValue<string>(`${id}-content`);

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

  const isDisabled = wrapValue(disabled).as((d) => Boolean(d));
  const triggerOnFocusOnly = wrapValue(triggerOnFocusOnlyProp).as((t) => Boolean(t));

  const popper = usePopper({
    id: `${id}-popper`,
    anchorRef: triggerRef,
    contentRef,
    placement,
    gutter,
    onCurrentPlacementChange,
    ...popperRest,
  });

  let closeTimeoutId: ReturnType<typeof setTimeout> | undefined;

  const ensureTooltipEntry = () => {
    activeTooltips.set(tooltipInternalKey, hideTooltip);
  };

  const closeOtherTooltips = () => {
    for (const [key, hideFn] of activeTooltips.entries()) {
      if (key !== tooltipInternalKey) {
        hideFn(true);
        activeTooltips.delete(key);
      }
    }
  };

  const cancelOpening = () => {
    if (isServer()) return;
    if (globalWarmUpTimeout !== undefined) {
      clearTimeout(globalWarmUpTimeout);
      globalWarmUpTimeout = undefined;
    }
    globalWarmedUp = false;
  };

  const cancelClosing = () => {
    if (isServer()) return;
    if (closeTimeoutId !== undefined) {
      clearTimeout(closeTimeoutId);
      closeTimeoutId = undefined;
    }
  };

  const hideTooltip = (immediate = false) => {
    if (isServer()) return;

    if (immediate || closeDelay <= 0) {
      cancelClosing();
      setOpen(false);
    } else if (closeTimeoutId === undefined) {
      closeTimeoutId = setTimeout(() => {
        closeTimeoutId = undefined;
        setOpen(false);
      }, closeDelay);
    }

    if (globalWarmUpTimeout !== undefined) {
      clearTimeout(globalWarmUpTimeout);
      globalWarmUpTimeout = undefined;
    }

    if (skipDelayDuration >= 0) {
      if (globalSkipDelayTimeout !== undefined) {
        clearTimeout(globalSkipDelayTimeout);
      }
      globalSkipDelayTimeout = setTimeout(() => {
        globalSkipDelayTimeout = undefined;
      }, skipDelayDuration);
    }

    if (globalWarmedUp) {
      if (globalCoolDownTimeout !== undefined) {
        clearTimeout(globalCoolDownTimeout);
      }
      globalCoolDownTimeout = setTimeout(() => {
        activeTooltips.delete(tooltipInternalKey);
        globalCoolDownTimeout = undefined;
        globalWarmedUp = false;
      }, closeDelay);
    }
  };

  const showTooltip = () => {
    if (isServer()) return;

    cancelClosing();
    closeOtherTooltips();
    ensureTooltipEntry();
    globalWarmedUp = true;
    setOpen(true);

    if (globalWarmUpTimeout !== undefined) {
      clearTimeout(globalWarmUpTimeout);
      globalWarmUpTimeout = undefined;
    }
    if (globalCoolDownTimeout !== undefined) {
      clearTimeout(globalCoolDownTimeout);
      globalCoolDownTimeout = undefined;
    }
    if (globalSkipDelayTimeout !== undefined) {
      clearTimeout(globalSkipDelayTimeout);
      globalSkipDelayTimeout = undefined;
    }
  };

  const warmupTooltip = () => {
    if (isServer()) return;

    closeOtherTooltips();
    ensureTooltipEntry();

    if (!isOpenState() && globalWarmUpTimeout === undefined && !globalWarmedUp) {
      globalWarmUpTimeout = setTimeout(() => {
        globalWarmUpTimeout = undefined;
        globalWarmedUp = true;
        showTooltip();
      }, openDelay);
    } else if (!isOpenState()) {
      showTooltip();
    }
  };

  const openTooltip = (immediate = false) => {
    if (isServer() || isDisabled()) return;

    if (
      !immediate &&
      openDelay > 0 &&
      closeTimeoutId === undefined &&
      globalSkipDelayTimeout === undefined
    ) {
      warmupTooltip();
    } else {
      showTooltip();
    }
  };

  const isTargetOnTooltip = (target: Node | null): boolean => {
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

    if (isTargetOnTooltip(target)) {
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

    hideTooltip();
  };

  const handleScroll = (event: Event) => {
    const triggerEl = triggerRef();
    if (!triggerEl || !isOpenState()) return;
    const target = event.target as Node | null;
    if (target && contains(target, triggerEl)) {
      hideTooltip(true);
    }
  };

  inClient(() => {
    let cleanupOpenListeners: (() => void) | undefined;

    isOpenState.bind((open) => {
      cleanupOpenListeners?.();
      cleanupOpenListeners = undefined;

      if (!open) return;

      const doc = getDocument();
      const win = getOwnerWindow(triggerRef());

      doc.addEventListener("pointermove", onHoverOutside, true);
      win.addEventListener("scroll", handleScroll, { capture: true });

      cleanupOpenListeners = () => {
        doc.removeEventListener("pointermove", onHoverOutside, true);
        win.removeEventListener("scroll", handleScroll, { capture: true });
      };
    });

    onUnmounted(() => {
      cleanupOpenListeners?.();
      cancelClosing();
      activeTooltips.delete(tooltipInternalKey);
    });
  });

  return {
    id,
    contentId,
    isOpen: isOpenState.as((o) => o),
    isDisabled,
    triggerOnFocusOnly,
    triggerRef,
    contentRef,
    popper,
    forceMount,
    portalTarget,
    openTooltip,
    hideTooltip,
    cancelOpening,
    cancelClosing,
    isTargetOnTooltip,
  };
}

