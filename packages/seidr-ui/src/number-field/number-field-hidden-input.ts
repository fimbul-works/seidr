import { $, mergeStyleProps, type SeidrElementProps, SeidrError } from "@fimbul-works/seidr";
import { DATA_COMPONENT_NUMBER_FIELD, DATA_PART_HIDDEN_INPUT, VISUALLY_HIDDEN_STYLES } from "../constants.js";
import type { UseNumberFieldResult } from "./types.js";

export interface NumberFieldHiddenInputProps extends SeidrElementProps<"input"> {
  /**
   * Explicit number field coordinator instance providing reactive state.
   */
  instance?: UseNumberFieldResult;
}

/**
 * NumberFieldHiddenInput is a visually hidden input that holds the raw unformatted numeric value
 * for native HTML form submissions and autofill.
 */
export function NumberFieldHiddenInput(props: NumberFieldHiddenInputProps = {}): HTMLInputElement {
  const { instance: nf, style, ...rest } = props;

  if (!nf) {
    throw new SeidrError("NumberFieldHiddenInput requires an instance coordinator");
  }

  const mergedStyle = mergeStyleProps(VISUALLY_HIDDEN_STYLES, style);

  return $("input", {
    type: "text",
    tabIndex: -1,
    "aria-hidden": "true",
    ref: nf.hiddenInputRef,
    style: mergedStyle,
    name: nf.formControl.name,
    value: nf.rawValue.as((r) => (!Number.isNaN(r) ? String(r) : "")),
    disabled: nf.formControl.isDisabled,
    readOnly: nf.formControl.isReadOnly,
    required: nf.formControl.isRequired,
    dataComponent: DATA_COMPONENT_NUMBER_FIELD,
    dataPart: DATA_PART_HIDDEN_INPUT,
    ...rest,
  } as SeidrElementProps<"input">);
}
