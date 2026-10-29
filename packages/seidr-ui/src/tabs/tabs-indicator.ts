import { isObj } from "@fimbul-works/hvat";
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
import type { TabsIndicatorProps } from "./types.js";

/**
 * Visual indicator that tracks and highlights the active tab trigger (role="presentation").
 */
export function TabsIndicator<T extends keyof SeidrElementTagNameMap = "div">(
  props: TabsIndicatorProps<T> = {},
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "div" as T, instance: tabs, style: userStyle, ...rest } = props;

  if (!tabs) {
    throw new SeidrError("TabsIndicator requires an instance coordinator");
  }

  const offset = createValue(0);
  const size = createValue(0);

  const updatePosition = (target: HTMLElement | null) => {
    if (!target) {
      offset(0);
      size(0);
      return;
    }
    if (tabs.orientation === "horizontal") {
      offset(target.offsetLeft);
      size(target.offsetWidth);
    } else {
      offset(target.offsetTop);
      size(target.offsetHeight);
    }
  };

  inClient(() => {
    tabs.selectedTabElement.bind((el) => {
      updatePosition(el);
    });

    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(() => {
        updatePosition(tabs.selectedTabElement());
      });

      tabs.selectedTabElement.bind((el) => {
        ro.disconnect();
        if (el) ro.observe(el);
      });

      onUnmounted(() => ro.disconnect());
    }
  });

  const transform = offset.as((o) => (tabs.orientation === "horizontal" ? `translateX(${o}px)` : `translateY(${o}px)`));
  const sizePx = size.as((s) => `${s}px`);

  const baseStyle: Record<string, any> = {
    "--seidr-tabs-indicator-transform": transform,
    "--seidr-tabs-indicator-size": sizePx,
    transform,
    ...(tabs.orientation === "horizontal" ? { width: sizePx } : { height: sizePx }),
  };

  return $(
    as as T,
    {
      role: "presentation",
      dataOrientation: tabs.orientation,
      dataComponent: "tabs",
      dataPart: "indicator",
      style: mergeStyleProps(baseStyle, userStyle),
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
