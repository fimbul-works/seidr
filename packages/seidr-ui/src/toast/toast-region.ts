import { createComponent, Portal } from "@fimbul-works/seidr";
import { createToastRegion } from "./create-toast-region.js";
import type { ToastRegionProps, ToastRegionRootProps } from "./types.js";

/**
 * Unified all-in-one ToastRegion component (Tier 1).
 * Renders the accessible region landmark and ordered toast list, optionally portaled into `portalTarget`.
 */
export const ToastRegion = createComponent((props: ToastRegionProps = {}) => {
  const {
    id,
    translations,
    ariaLabel,
    hotkey,
    duration,
    limit,
    swipeDirection,
    swipeThreshold,
    pauseOnInteraction,
    pauseOnPageIdle,
    topLayer,
    regionId,
    dataComponent,
    as = "div",
    portalTarget,
    regionProps = {},
    listProps = {},
    children,
  } = props;

  const region = createToastRegion({
    id,
    translations,
    ariaLabel,
    hotkey,
    duration,
    limit,
    swipeDirection,
    swipeThreshold,
    pauseOnInteraction,
    pauseOnPageIdle,
    topLayer,
    regionId,
    dataComponent,
  });

  const renderRegion = () =>
    region.Region({ as, ...regionProps } as ToastRegionRootProps<"div">, [
      region.List(listProps),
      children,
    ]);

  if (portalTarget) {
    return Portal(portalTarget, renderRegion, "ToastRegionPortal");
  }

  return renderRegion();
}, "ToastRegion");

