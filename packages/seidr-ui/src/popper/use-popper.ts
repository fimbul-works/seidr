import { isFn } from "@fimbul-works/hvat";
import {
  createRef,
  createValue,
  inClient,
  isRef,
  type ObservableValue,
  onUnmounted,
  type Ref,
  useId,
  type Value,
  wrapValue,
} from "@fimbul-works/seidr";
import { arrow, autoUpdate, computePosition, flip, hide, offset, platform, shift, size } from "@floating-ui/dom";
import { useDirection } from "../hooks/use-direction.js";
import type { BasePlacement, Placement, UsePopperOptions, UsePopperResult } from "./types.js";
import { getAnchorElement, getTransformOrigin, isValidPlacement } from "./utils.js";

/**
 * Headless reactive coordinator for positioning a floating element relative to an anchor.
 */
export function usePopper(options: UsePopperOptions = {}): UsePopperResult {
  const {
    id: customId,
    gutter = 0,
    shift: shiftOffset = 0,
    flip: flipOption = true,
    slide = true,
    overlap = false,
    sameWidth = false,
    fitViewport = false,
    hideWhenDetached = false,
    detachedPadding = 0,
    arrowPadding = 4,
    overflowPadding = 8,
    onCurrentPlacementChange,
    getAnchorRect,
  } = options;

  const id = customId ?? useId("popper");
  const preferredPlacement: ObservableValue<Placement> = wrapValue(options.placement ?? "bottom");
  const currentPlacement: Value<Placement> = createValue<Placement>(preferredPlacement());

  const anchorRef: Ref<HTMLElement> = isRef(options.anchorRef) ? options.anchorRef : createRef<HTMLElement>();

  const contentRef: Ref<HTMLElement> = isRef(options.contentRef) ? options.contentRef : createRef<HTMLElement>();

  const positionerRef: Ref<HTMLElement> = createRef<HTMLElement>();
  const arrowRef: Ref<HTMLElement> = createRef<HTMLElement>();

  const direction = useDirection();

  const resolveAnchorElement = (): HTMLElement | null | undefined => {
    if (isRef(options.anchorRef)) {
      return options.anchorRef();
    }
    if (isFn(options.anchorRef)) {
      return options.anchorRef();
    }
    return anchorRef();
  };

  const resolveContentElement = (): HTMLElement | null | undefined => {
    if (isRef(options.contentRef)) {
      return options.contentRef();
    }
    if (isFn(options.contentRef)) {
      return options.contentRef();
    }
    return contentRef();
  };

  let cleanupAutoUpdate: (() => void) | undefined;

  const updatePosition = async () => {
    const anchorEl = resolveAnchorElement();
    const floatingEl = positionerRef();
    const arrowEl = arrowRef();

    if (!anchorEl || !floatingEl) {
      return;
    }

    const referenceEl = getAnchorElement(anchorEl, getAnchorRect);
    const arrowOffset = (arrowEl?.clientHeight || 0) / 2;
    const finalGutter = gutter + arrowOffset;

    floatingEl.style.setProperty("--seidr-popper-content-overflow-padding", `${overflowPadding}px`);

    // Virtual elements trigger recalculation
    referenceEl.getBoundingClientRect();

    const middlewareList = [
      offset(({ placement }) => {
        const hasAlignment = !!placement.split("-")[1];
        return {
          mainAxis: finalGutter,
          crossAxis: !hasAlignment ? shiftOffset : undefined,
          alignmentAxis: shiftOffset,
        };
      }),
    ];

    if (flipOption !== false) {
      const fallbackPlacements = typeof flipOption === "string" ? flipOption.split(" ") : undefined;

      if (fallbackPlacements !== undefined && !fallbackPlacements.every(isValidPlacement)) {
        throw new Error("`flip` expects a space-delimited list of placements");
      }

      middlewareList.push(
        flip({
          padding: overflowPadding,
          fallbackPlacements,
        }),
      );
    }

    if (slide || overlap) {
      middlewareList.push(
        shift({
          mainAxis: slide,
          crossAxis: overlap,
          padding: overflowPadding,
        }),
      );
    }

    middlewareList.push(
      size({
        padding: overflowPadding,
        apply({ availableWidth, availableHeight, rects }) {
          const referenceWidth = Math.round(rects.reference.width);
          const floorWidth = Math.floor(availableWidth);
          const floorHeight = Math.floor(availableHeight);

          floatingEl.style.setProperty("--seidr-popper-anchor-width", `${referenceWidth}px`);
          floatingEl.style.setProperty("--seidr-popper-content-available-width", `${floorWidth}px`);
          floatingEl.style.setProperty("--seidr-popper-content-available-height", `${floorHeight}px`);

          if (sameWidth) {
            floatingEl.style.width = `${referenceWidth}px`;
          }

          if (fitViewport) {
            floatingEl.style.maxWidth = `${floorWidth}px`;
            floatingEl.style.maxHeight = `${floorHeight}px`;
          }
        },
      }),
    );

    if (hideWhenDetached) {
      middlewareList.push(hide({ padding: detachedPadding }));
    }

    if (arrowEl) {
      middlewareList.push(arrow({ element: arrowEl, padding: arrowPadding }));
    }

    const pos = await computePosition(referenceEl, floatingEl, {
      placement: preferredPlacement(),
      strategy: "absolute",
      middleware: middlewareList,
      platform: {
        ...platform,
        isRTL: () => direction() === "rtl",
      },
    });

    currentPlacement(pos.placement);
    onCurrentPlacementChange?.(pos.placement);

    floatingEl.style.setProperty(
      "--seidr-popper-content-transform-origin",
      getTransformOrigin(pos.placement, direction()),
    );

    const x = Math.round(pos.x);
    const y = Math.round(pos.y);

    let visibility: string | undefined;
    if (hideWhenDetached) {
      visibility = pos.middlewareData.hide?.referenceHidden ? "hidden" : "visible";
    }

    Object.assign(floatingEl.style, {
      top: "0",
      left: "0",
      transform: `translate3d(${x}px, ${y}px, 0)`,
      visibility,
    });

    if (arrowEl && pos.middlewareData.arrow) {
      const { x: arrowX, y: arrowY } = pos.middlewareData.arrow;
      const baseDir = pos.placement.split("-")[0] as BasePlacement;

      Object.assign(arrowEl.style, {
        left: "",
        right: "",
        top: "",
        bottom: "",
      });

      Object.assign(arrowEl.style, {
        left: arrowX != null ? `${arrowX}px` : "",
        top: arrowY != null ? `${arrowY}px` : "",
        [baseDir]: "100%",
      });
    }

    // Sync z-index with content element if available
    const contentEl = resolveContentElement();
    if (contentEl) {
      floatingEl.style.zIndex = getComputedStyle(contentEl).zIndex;
    }
  };

  const startAutoUpdate = () => {
    const anchorEl = resolveAnchorElement();
    const floatingEl = positionerRef();

    cleanupAutoUpdate?.();
    cleanupAutoUpdate = undefined;

    if (!anchorEl || !floatingEl) {
      return;
    }

    cleanupAutoUpdate = autoUpdate(
      anchorEl,
      floatingEl,
      () => {
        void updatePosition();
      },
      {
        elementResize: typeof ResizeObserver === "function",
      },
    );
  };

  inClient(() => {
    preferredPlacement.watch(() => {
      void updatePosition();
    });

    positionerRef.bind((el) => {
      if (el) {
        startAutoUpdate();
        void updatePosition();
      } else {
        cleanupAutoUpdate?.();
        cleanupAutoUpdate = undefined;
      }
    });

    anchorRef.bind((el) => {
      if (el && positionerRef()) {
        startAutoUpdate();
        void updatePosition();
      }
    });
  });

  onUnmounted(() => {
    cleanupAutoUpdate?.();
    cleanupAutoUpdate = undefined;
  });

  return {
    id,
    placement: preferredPlacement,
    currentPlacement,
    anchorRef,
    positionerRef,
    arrowRef,
    contentRef,
    updatePosition,
  };
}
