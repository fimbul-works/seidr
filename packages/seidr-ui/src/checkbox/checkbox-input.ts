import { $, mergeStyleProps, onUnmounted, type SeidrElementProps, SeidrError } from "@fimbul-works/seidr";
import { VISUALLY_HIDDEN_STYLES } from "../constants.js";
import type { UseCheckboxResult } from "./types.js";

export interface CheckboxInputProps extends SeidrElementProps<"input"> {
  /**
   * Explicit checkbox instance providing reactive state.
   */
  instance?: UseCheckboxResult;
}

/**
 * The native HTML checkbox input that is visually hidden.
 * Ensures full WAI-ARIA and native HTML form submission compatibility.
 */
export function CheckboxInput(props: CheckboxInputProps = {}): HTMLInputElement {
  const { instance: cb, id: customId, style, onchange, onfocus, onblur, ...rest } = props;

  if (!cb) {
    throw new SeidrError("CheckboxInput requires an instance prop");
  }

  const fieldId = customId ?? cb.id.as((base) => `${base}-input`);
  onUnmounted(cb.formControl.registerField(fieldId));

  const mergedStyle = mergeStyleProps(VISUALLY_HIDDEN_STYLES, style);

  const handleChange = (e: Event) => {
    (onchange as any)?.(e);
    if (e.defaultPrevented) return;

    const target = e.target as HTMLInputElement;
    cb.setChecked(target.checked);

    // Keep DOM input synchronized with guarded or controlled state
    target.checked = cb.checked();
    target.indeterminate = cb.indeterminate();
  };

  const handleFocus = (e: FocusEvent) => {
    (onfocus as any)?.(e);
    cb.isFocused(true);
  };

  const handleBlur = (e: FocusEvent) => {
    (onblur as any)?.(e);
    cb.isFocused(false);
  };

  return $("input", {
    ...cb.fieldProps,
    id: cb.formControl.fieldId,
    ...rest,
    ref: cb.inputRef,
    style: mergedStyle,
    onchange: handleChange,
    onfocus: handleFocus,
    onblur: handleBlur,
  } as SeidrElementProps<"input">);
}
