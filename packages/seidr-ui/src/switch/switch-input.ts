import { $, mergeStyleProps, onUnmounted, type SeidrElementProps, SeidrError } from "@fimbul-works/seidr";
import { DATA_COMPONENT_SWITCH, DATA_PART_INPUT, VISUALLY_HIDDEN_STYLES } from "../constants.js";
import type { UseSwitchResult } from "./types.js";

export interface SwitchInputProps extends SeidrElementProps<"input"> {
  /**
   * Explicit switch instance providing reactive state.
   */
  instance?: UseSwitchResult;
}

/**
 * The native HTML checkbox input that is visually hidden.
 * Ensures full WAI-ARIA switch compliance and HTML form submission compatibility.
 */
export function SwitchInput(props: SwitchInputProps = {}): HTMLInputElement {
  const { instance: sw, id: customId, style, onchange, onfocus, onblur, ...rest } = props;

  if (!sw) {
    throw new SeidrError("SwitchInput requires an instance coordinator");
  }

  const fieldId = customId ?? sw.id.as((base: string) => `${base}-input`);
  onUnmounted(sw.formControl.registerField(fieldId));

  const handleChange = (e: Event) => {
    (onchange as any)?.(e);
    if (e.defaultPrevented) return;

    const target = e.target as HTMLInputElement;
    sw.setChecked(target.checked);

    // Keep DOM input synchronized with guarded or controlled state
    target.checked = sw.checked();
  };

  const handleFocus = (e: FocusEvent) => {
    (onfocus as any)?.(e);
    sw.isFocused(true);
  };

  const handleBlur = (e: FocusEvent) => {
    (onblur as any)?.(e);
    sw.isFocused(false);
  };

  return $("input", {
    ...sw.fieldProps,
    id: sw.formControl.fieldId,
    dataComponent: DATA_COMPONENT_SWITCH,
    dataPart: DATA_PART_INPUT,
    ...rest,
    ref: sw.inputRef,
    style: mergeStyleProps(VISUALLY_HIDDEN_STYLES, style),
    onchange: handleChange,
    onfocus: handleFocus,
    onblur: handleBlur,
  } as SeidrElementProps<"input">);
}
