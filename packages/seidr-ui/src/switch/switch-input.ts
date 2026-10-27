import { isObj } from "@fimbul-works/hvat";
import { $, type SeidrElementProps, SeidrError } from "@fimbul-works/seidr";
import { VISUALLY_HIDDEN_STYLES } from "../constants.js";
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
  const { instance, style, onchange, onfocus, onblur, ...rest } = props;

  if (!instance) {
    throw new SeidrError(
      "[seidr-ui]: SwitchInput requires an instance prop or must be created via Switch.create() / Switch.",
    );
  }

  if (typeof rest.id === "string") {
    instance.formControl.registerField(rest.id);
  }

  const mergedStyle = isObj(style) ? { ...VISUALLY_HIDDEN_STYLES, ...style } : VISUALLY_HIDDEN_STYLES;

  const handleChange = (e: Event) => {
    (onchange as any)?.(e);
    if (e.defaultPrevented) return;

    const target = e.target as HTMLInputElement;
    instance.setChecked(target.checked);

    // Keep DOM input synchronized with guarded or controlled state
    target.checked = instance.checked();
  };

  const handleFocus = (e: FocusEvent) => {
    (onfocus as any)?.(e);
    instance.isFocused(true);
  };

  const handleBlur = (e: FocusEvent) => {
    (onblur as any)?.(e);
    instance.isFocused(false);
  };

  return $("input", {
    ...instance.fieldProps,
    ...rest,
    ref: instance.inputRef,
    style: mergedStyle,
    onchange: handleChange,
    onfocus: handleFocus,
    onblur: handleBlur,
  });
}
