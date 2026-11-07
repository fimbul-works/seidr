import { createComponent, type SeidrChild, type SeidrElementTagNameMap } from "@fimbul-works/seidr";
import { createPopper } from "./create-popper.js";
import type { PopperProps, PopperRootProps } from "./types.js";

/**
 * All-in-One Popper component factory (Tier 1).
 */
export function PopperFactory<T extends keyof SeidrElementTagNameMap = "div">(
  props: PopperProps<T> = {} as PopperProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "div" as T,
    anchorRef,
    contentRef,
    getAnchorRect,
    placement,
    gutter,
    shift,
    flip,
    slide,
    overlap,
    sameWidth,
    fitViewport,
    hideWhenDetached,
    detachedPadding,
    arrowPadding,
    overflowPadding,
    onCurrentPlacementChange,
    rootProps,
    positionerProps,
    arrowProps,
    showArrow = false,
    id,
    ...rest
  } = props;

  const popper = createPopper({
    id,
    anchorRef,
    contentRef,
    getAnchorRect,
    placement,
    gutter,
    shift,
    flip,
    slide,
    overlap,
    sameWidth,
    fitViewport,
    hideWhenDetached,
    detachedPadding,
    arrowPadding,
    overflowPadding,
    onCurrentPlacementChange,
  });

  const positionerChildren: SeidrChild[] = [];
  if (showArrow) {
    positionerChildren.push(popper.Arrow(arrowProps));
  }

  if (children) {
    if (Array.isArray(children)) {
      positionerChildren.push(...children);
    } else {
      positionerChildren.push(children);
    }
  }

  return popper.Root({ as, ...rootProps, ...rest } as PopperRootProps<T>, [
    popper.Positioner(positionerProps, positionerChildren),
  ]);
}

/**
 * Floating element positioning component (Tier 1).
 */
export const Popper = createComponent(PopperFactory, "Popper");
