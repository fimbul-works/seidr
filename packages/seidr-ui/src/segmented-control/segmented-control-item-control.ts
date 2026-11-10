import { type SeidrChild, type SeidrElementProps, type SeidrElementTagNameMap, SeidrError } from "@fimbul-works/seidr";
import { DATA_COMPONENT_SEGMENTED_CONTROL, DATA_PART_ITEM_CONTROL } from "../constants.js";
import { RadioGroupItemControl, type RadioGroupItemControlProps } from "../radio-group/radio-group-item-control.js";
import type { UseSegmentedControlItemResult } from "./types.js";

export interface SegmentedControlItemControlOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  /**
   * The HTML element tag name to render.
   * @default "div"
   */
  as?: T;

  /**
   * Explicit segmented control item instance providing reactive state.
   */
  instance?: UseSegmentedControlItemResult;
}

export type SegmentedControlItemControlProps<T extends keyof SeidrElementTagNameMap = "div"> =
  SegmentedControlItemControlOptions<T> & SeidrElementProps<T>;

/**
 * The visual container representing a segment pill or button.
 */
export function SegmentedControlItemControl<T extends keyof SeidrElementTagNameMap = "div">(
  props: SegmentedControlItemControlProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "div" as T, instance: item, ...rest } = props;

  if (!item) {
    throw new SeidrError("SegmentedControlItemControl requires an instance coordinator");
  }

  return RadioGroupItemControl(
    {
      as,
      instance: item,
      dataComponent: DATA_COMPONENT_SEGMENTED_CONTROL,
      dataPart: DATA_PART_ITEM_CONTROL,
      ...rest,
    } as RadioGroupItemControlProps<T>,
    children,
  );
}
