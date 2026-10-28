import { isObj } from "@fimbul-works/hvat";
import { $, type SeidrElementProps, SeidrError } from "@fimbul-works/seidr";
import { VISUALLY_HIDDEN_STYLES } from "../constants.js";
import type { UseRadioGroupItemResult } from "./types.js";

export interface RadioGroupItemInputProps extends SeidrElementProps<"input"> {
  /**
   * Explicit radio group item instance providing reactive state.
   */
  instance?: UseRadioGroupItemResult;
}

/**
 * The native HTML radio input that is visually hidden.
 * Ensures full WAI-ARIA radio compliance and HTML form submission compatibility.
 */
export function RadioGroupItemInput(props: RadioGroupItemInputProps = {}): HTMLInputElement {
  const { instance: item, style, onclick, onchange, onfocus, onblur, ...rest } = props;

  if (!item) {
    throw new SeidrError("RadioGroupItemInput requires an instance prop");
  }

  const mergedStyle = isObj(style) ? { ...VISUALLY_HIDDEN_STYLES, ...style } : VISUALLY_HIDDEN_STYLES;

  const handleClick = (e: MouseEvent) => {
    (onclick as any)?.(e);
    if (e.defaultPrevented) return;

    if (item.isDisabled() || item.group.formControl.isReadOnly()) {
      e.preventDefault();
    }
  };

  const handleChange = (e: Event) => {
    (onchange as any)?.(e);
    if (e.defaultPrevented) return;

    const target = e.target as HTMLInputElement;
    if (target.checked) {
      item.select();
    }

    // Keep all DOM inputs in the group synchronized with current reactive state
    const root = item.group.rootRef();
    if (root) {
      const inputs = root.querySelectorAll("input");
      for (const el of inputs) {
        const radio = el as HTMLInputElement;
        if (radio.type === "radio") {
          radio.checked = item.group.isSelectedValue(radio.value);
        }
      }
    } else {
      target.checked = item.isSelected();
    }
  };

  const handleFocus = (e: FocusEvent) => {
    (onfocus as any)?.(e);
    item.isFocused(true);
  };

  const handleBlur = (e: FocusEvent) => {
    (onblur as any)?.(e);
    item.isFocused(false);
  };

  return $("input", {
    ...item.fieldProps,
    ...rest,
    ref: item.inputRef,
    style: mergedStyle,
    onclick: handleClick,
    onchange: handleChange,
    onfocus: handleFocus,
    onblur: handleBlur,
  } as SeidrElementProps<"input">);
}
