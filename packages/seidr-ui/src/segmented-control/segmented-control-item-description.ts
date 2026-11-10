import { type SeidrChild, type SeidrElementProps, type SeidrElementTagNameMap, SeidrError } from "@fimbul-works/seidr";
import { DATA_COMPONENT_SEGMENTED_CONTROL, DATA_PART_ITEM_DESCRIPTION } from "../constants.js";
import {
  RadioGroupItemDescription,
  type RadioGroupItemDescriptionProps,
} from "../radio-group/radio-group-item-description.js";
import type { UseSegmentedControlItemResult } from "./types.js";

export interface SegmentedControlItemDescriptionOptions<T extends keyof SeidrElementTagNameMap = "span"> {
  /**
   * The HTML element tag name to render.
   * @default "span"
   */
  as?: T;

  /**
   * Explicit segmented control item instance providing reactive state.
   */
  instance?: UseSegmentedControlItemResult;
}

export type SegmentedControlItemDescriptionProps<T extends keyof SeidrElementTagNameMap = "span"> =
  SegmentedControlItemDescriptionOptions<T> & SeidrElementProps<T>;

/**
 * Descriptive text associated with an individual segment option.
 */
export function SegmentedControlItemDescription<T extends keyof SeidrElementTagNameMap = "span">(
  props: SegmentedControlItemDescriptionProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "span" as T, instance: item, ...rest } = props;

  if (!item) {
    throw new SeidrError("SegmentedControlItemDescription requires an instance coordinator");
  }

  return RadioGroupItemDescription(
    {
      as,
      instance: item,
      dataComponent: DATA_COMPONENT_SEGMENTED_CONTROL,
      dataPart: DATA_PART_ITEM_DESCRIPTION,
      ...rest,
    } as RadioGroupItemDescriptionProps<T>,
    children,
  );
}
