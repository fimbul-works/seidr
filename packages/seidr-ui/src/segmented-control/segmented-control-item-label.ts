import {
  type ReactiveValue,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { RadioGroupItemLabel, type RadioGroupItemLabelProps } from "../radio-group/radio-group-item-label.js";
import type { UseSegmentedControlItemResult } from "./types.js";

export interface SegmentedControlItemLabelOptions<T extends keyof SeidrElementTagNameMap = "label"> {
  /**
   * The HTML element tag name to render.
   * @default "label"
   */
  as?: T;

  /**
   * Explicit segmented control item instance providing reactive state.
   */
  instance?: UseSegmentedControlItemResult;

  /**
   * The id of the input that this label is associated with.
   */
  htmlFor?: ReactiveValue<string>;
}

export type SegmentedControlItemLabelProps<T extends keyof SeidrElementTagNameMap = "label"> =
  SegmentedControlItemLabelOptions<T> & SeidrElementProps<T>;

/**
 * The accessible label associated with an individual segment option.
 */
export function SegmentedControlItemLabel<T extends keyof SeidrElementTagNameMap = "label">(
  props: SegmentedControlItemLabelProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "label" as T, instance: item, ...rest } = props;

  if (!item) {
    throw new SeidrError("SegmentedControlItemLabel requires an instance coordinator");
  }

  return RadioGroupItemLabel(
    {
      as,
      instance: item,
      dataComponent: "segmented-control",
      dataPart: "item-label",
      ...rest,
    } as RadioGroupItemLabelProps<T>,
    children,
  );
}

