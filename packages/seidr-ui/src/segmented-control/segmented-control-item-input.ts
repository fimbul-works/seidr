import { type SeidrElementProps, SeidrError } from "@fimbul-works/seidr";
import { RadioGroupItemInput } from "../radio-group/radio-group-item-input.js";
import type { UseSegmentedControlItemResult } from "./types.js";

export interface SegmentedControlItemInputProps extends SeidrElementProps<"input"> {
  /**
   * Explicit segmented control item instance providing reactive state.
   */
  instance?: UseSegmentedControlItemResult;
}

/**
 * The native HTML radio input that is visually hidden.
 * Ensures full WAI-ARIA radio compliance and HTML form submission compatibility.
 */
export function SegmentedControlItemInput(props: SegmentedControlItemInputProps = {}): HTMLInputElement {
  const { instance: item, ...rest } = props;

  if (!item) {
    throw new SeidrError("SegmentedControlItemInput requires an instance coordinator");
  }

  return RadioGroupItemInput({
    instance: item,
    dataComponent: "segmented-control",
    dataPart: "item-input",
    ...rest,
  });
}

