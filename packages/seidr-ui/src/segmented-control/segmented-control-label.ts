import { type SeidrChild, type SeidrElementProps, type SeidrElementTagNameMap, SeidrError } from "@fimbul-works/seidr";
import { DATA_COMPONENT_SEGMENTED_CONTROL } from "../constants.js";
import { FormControlLabel, type FormControlLabelProps } from "../form-control/form-control-label.js";
import type { UseSegmentedControlResult } from "./types.js";

export interface SegmentedControlLabelOptions<T extends keyof SeidrElementTagNameMap = "span"> {
  /**
   * The HTML element tag name to render.
   * @default "span"
   */
  as?: T;

  /**
   * Explicit segmented control instance providing reactive state.
   */
  instance?: UseSegmentedControlResult;
}

export type SegmentedControlLabelProps<T extends keyof SeidrElementTagNameMap = "span"> =
  SegmentedControlLabelOptions<T> & SeidrElementProps<T>;

/**
 * The label that gives the user information on the segmented control.
 */
export function SegmentedControlLabel<T extends keyof SeidrElementTagNameMap = "span">(
  props: SegmentedControlLabelProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "span" as T, instance: sc, ...rest } = props;

  if (!sc) {
    throw new SeidrError("SegmentedControlLabel requires an instance coordinator");
  }

  return FormControlLabel(
    {
      as,
      instance: sc.formControl,
      ...sc.dataset,
      dataComponent: DATA_COMPONENT_SEGMENTED_CONTROL,
      ...rest,
    } as FormControlLabelProps<T>,
    children,
  );
}
