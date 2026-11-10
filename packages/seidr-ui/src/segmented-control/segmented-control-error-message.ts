import {
  type DerivedValue,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_SEGMENTED_CONTROL } from "../constants.js";
import {
  FormControlErrorMessage,
  type FormControlErrorMessageProps,
} from "../form-control/form-control-error-message.js";
import type { UseSegmentedControlResult } from "./types.js";

export interface SegmentedControlErrorMessageOptions<T extends keyof SeidrElementTagNameMap = "span"> {
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

export type SegmentedControlErrorMessageProps<T extends keyof SeidrElementTagNameMap = "span"> =
  SegmentedControlErrorMessageOptions<T> & SeidrElementProps<T>;

/**
 * The error message displayed when the segmented control is in an invalid state.
 */
export function SegmentedControlErrorMessage<T extends keyof SeidrElementTagNameMap = "span">(
  props: SegmentedControlErrorMessageProps<T>,
  children?: SeidrChild | SeidrChild[],
): DerivedValue<SeidrElementTagNameMap[T] | null> {
  const { as = "span" as T, instance: sc, ...rest } = props;

  if (!sc) {
    throw new SeidrError("SegmentedControlErrorMessage requires an instance coordinator");
  }

  return FormControlErrorMessage(
    {
      as,
      instance: sc.formControl,
      ...sc.dataset,
      dataComponent: DATA_COMPONENT_SEGMENTED_CONTROL,
      ...rest,
    } as FormControlErrorMessageProps<T>,
    children,
  );
}
