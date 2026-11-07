import {
  $,
  type DerivedValue,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { RatingItemIndicatorProps, RatingItemState } from "./types.js";

/**
 * Visual indicator element inside a RatingItem displaying full, half, or empty states.
 */
export function RatingItemIndicator<T extends keyof SeidrElementTagNameMap = "span">(
  props: RatingItemIndicatorProps<T> = {} as RatingItemIndicatorProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "span" as T,
    instance,
    itemValue = 1,
    dataComponent = "rating",
    fullIcon = "★",
    halfIcon = "⯨",
    emptyIcon = "☆",
    children: propsChildren,
    ...rest
  } = props;

  if (!instance) {
    throw new SeidrError("RatingItemIndicator requires an instance coordinator");
  }

  const state: DerivedValue<RatingItemState> = instance.getItemState(itemValue);

  const iconContent = state.as((s) => {
    if (children || propsChildren) return (children ?? propsChildren) as SeidrChild;
    if (s === "checked") return fullIcon;
    if (s === "half") return halfIcon;
    return emptyIcon;
  });

  return $(
    as,
    {
      "aria-hidden": "true",
      dataComponent,
      dataPart: "item-indicator",
      dataState: state,
      ...rest,
    } as SeidrElementProps<T>,
    [iconContent],
  );
}

