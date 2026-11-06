import { type SeidrChild, type SeidrElementProps, type SeidrElementTagNameMap, SeidrError } from "@fimbul-works/seidr";
import { FormControlDescription, type FormControlDescriptionProps } from "../form-control/form-control-description.js";
import type { UseSegmentedControlResult } from "./types.js";

export interface SegmentedControlDescriptionOptions<T extends keyof SeidrElementTagNameMap = "span"> {
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

export type SegmentedControlDescriptionProps<T extends keyof SeidrElementTagNameMap = "span"> =
  SegmentedControlDescriptionOptions<T> & SeidrElementProps<T>;

/**
 * The description text or element giving additional information about the segmented control.
 */
export function SegmentedControlDescription<T extends keyof SeidrElementTagNameMap = "span">(
  props: SegmentedControlDescriptionProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "span" as T, instance: sc, ...rest } = props;

  if (!sc) {
    throw new SeidrError("SegmentedControlDescription requires an instance coordinator");
  }

  return FormControlDescription(
    {
      as,
      instance: sc.formControl,
      ...sc.dataset,
      dataComponent: "segmented-control",
      ...rest,
    } as FormControlDescriptionProps<T>,
    children,
  );
}

