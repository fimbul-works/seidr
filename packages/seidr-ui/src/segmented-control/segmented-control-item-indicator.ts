import type {
  DerivedValue,
  ReactiveValue,
  SeidrChild,
  SeidrElementProps,
  SeidrElementTagNameMap,
} from "@fimbul-works/seidr";
import { SeidrError } from "@fimbul-works/seidr";
import { DATA_COMPONENT_SEGMENTED_CONTROL, DATA_PART_ITEM_INDICATOR } from "../constants.js";
import {
  RadioGroupItemIndicator,
  type RadioGroupItemIndicatorProps,
} from "../radio-group/radio-group-item-indicator.js";
import type { UseSegmentedControlItemResult } from "./types.js";

export interface SegmentedControlItemIndicatorOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  /**
   * The HTML element tag name to render.
   * @default "div"
   */
  as?: T;

  /**
   * Explicit segmented control item instance providing reactive state.
   */
  instance?: UseSegmentedControlItemResult;

  /**
   * Used to force mounting when more control is needed (e.g. for CSS animations).
   * When true or reactive truthy, the element is always rendered and styled via data-checked.
   * @default false
   */
  forceMount?: ReactiveValue<boolean>;
}

export type SegmentedControlItemIndicatorProps<T extends keyof SeidrElementTagNameMap = "div"> =
  SegmentedControlItemIndicatorOptions<T> & SeidrElementProps<T>;

/**
 * The visual indicator rendered when the segment item is in a checked state.
 */
export function SegmentedControlItemIndicator<T extends keyof SeidrElementTagNameMap = "div">(
  props: SegmentedControlItemIndicatorProps<T>,
  children?: SeidrChild | SeidrChild[],
): DerivedValue<SeidrElementTagNameMap[T] | null> {
  const { as = "div" as T, instance: item, ...rest } = props;

  if (!item) {
    throw new SeidrError("SegmentedControlItemIndicator requires an instance coordinator");
  }

  return RadioGroupItemIndicator(
    {
      as,
      instance: item,
      dataComponent: DATA_COMPONENT_SEGMENTED_CONTROL,
      dataPart: DATA_PART_ITEM_INDICATOR,
      ...rest,
    } as RadioGroupItemIndicatorProps<T>,
    children,
  );
}
