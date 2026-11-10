import {
  $,
  createValue,
  inClient,
  mergeStyleProps,
  onUnmounted,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_SEGMENTED_CONTROL, DATA_PART_INDICATOR } from "../constants.js";
import type { UseSegmentedControlResult } from "./types.js";

export interface SegmentedControlIndicatorOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  /**
   * The HTML element tag name to render.
   * @default "div"
   */
  as?: T;

  /**
   * Explicit segmented control instance providing reactive state.
   */
  instance?: UseSegmentedControlResult;
}

export type SegmentedControlIndicatorProps<T extends keyof SeidrElementTagNameMap = "div"> =
  SegmentedControlIndicatorOptions<T> & SeidrElementProps<T>;

/**
 * Visual indicator that tracks and highlights the active segment item (role="presentation").
 */
export function SegmentedControlIndicator<T extends keyof SeidrElementTagNameMap = "div">(
  props: SegmentedControlIndicatorProps<T> = {},
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "div" as T, instance: sc, style: userStyle, ...rest } = props;

  if (!sc) {
    throw new SeidrError("SegmentedControlIndicator requires an instance coordinator");
  }

  const offset = createValue(0);
  const width = createValue(0);
  const height = createValue(0);
  const isResizing = createValue(false);
  const isActive = createValue(false);

  const updatePosition = (target: HTMLElement | null) => {
    if (!target) {
      isActive(false);
      offset(0);
      width(0);
      height(0);
      return;
    }

    isActive(true);
    const w = target.offsetWidth;
    const h = target.offsetHeight;
    const x = target.offsetLeft;
    const y = target.offsetTop;

    offset(sc.orientation === "horizontal" ? x : y);
    width(w);
    height(h);
  };

  inClient(() => {
    sc.selectedItemElement.bind((el) => {
      updatePosition(el);
    });

    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(() => {
        isResizing(true);
        updatePosition(sc.selectedItemElement());
        isResizing(false);
      });

      sc.selectedItemElement.bind((el) => {
        ro.disconnect();
        if (el) ro.observe(el);
        const root = sc.rootRef();
        if (root) ro.observe(root);
      });

      onUnmounted(() => ro.disconnect());
    }
  });

  const transform = offset.as((o) => (sc.orientation === "horizontal" ? `translateX(${o}px)` : `translateY(${o}px)`));
  const widthPx = width.as((w) => `${w}px`);
  const heightPx = height.as((h) => `${h}px`);

  const baseStyle: Record<string, any> = {
    "--seidr-segmented-control-indicator-transform": transform,
    "--seidr-segmented-control-indicator-width": widthPx,
    "--seidr-segmented-control-indicator-height": heightPx,
    transform,
    width: widthPx,
    height: heightPx,
  };

  return $(
    as,
    {
      role: "presentation",
      dataOrientation: sc.orientation,
      dataResizing: isResizing.as((r) => (r ? "" : undefined)),
      dataState: isActive.as((a) => (a ? "active" : "inactive")),
      dataComponent: DATA_COMPONENT_SEGMENTED_CONTROL,
      dataPart: DATA_PART_INDICATOR,
      style: mergeStyleProps(baseStyle, userStyle),
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
