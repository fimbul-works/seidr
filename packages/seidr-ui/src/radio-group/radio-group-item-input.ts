import { $, mergeStyleProps, type SeidrElementProps, SeidrError } from "@fimbul-works/seidr";
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
  const { instance: item, style, onclick, onchange, onfocus, onblur, onkeydown, ...rest } = props;

  if (!item) {
    throw new SeidrError("RadioGroupItemInput requires an instance coordinator");
  }

  const mergedStyle = mergeStyleProps(VISUALLY_HIDDEN_STYLES, style);

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

  const handleKeyDown = (e: KeyboardEvent) => {
    (onkeydown as any)?.(e);
    if (e.defaultPrevented) return;

    const isNext = e.key === "ArrowRight" || e.key === "ArrowDown";
    const isPrev = e.key === "ArrowLeft" || e.key === "ArrowUp";
    const isHome = e.key === "Home";
    const isEnd = e.key === "End";

    if (!isNext && !isPrev && !isHome && !isEnd) {
      return;
    }

    e.preventDefault();

    const currentInput = e.currentTarget as HTMLInputElement;
    const root = item.group.rootRef();
    const groupName = currentInput.name;
    const selector = groupName
      ? `input[type="radio"][name="${CSS.escape ? CSS.escape(groupName) : groupName}"]:not([disabled])`
      : 'input[type="radio"]:not([disabled])';
    const inputs = Array.from(
      (root ?? (typeof document !== "undefined" ? document : null))?.querySelectorAll<HTMLInputElement>(selector) ?? [],
    );
    if (inputs.length === 0) return;

    const currentIndex = inputs.indexOf(currentInput);
    let targetIndex = currentIndex;

    if (isHome) {
      targetIndex = 0;
    } else if (isEnd) {
      targetIndex = inputs.length - 1;
    } else if (isNext) {
      targetIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % inputs.length;
    } else if (isPrev) {
      targetIndex = currentIndex === -1 ? inputs.length - 1 : (currentIndex - 1 + inputs.length) % inputs.length;
    }

    const targetInput = inputs[targetIndex];
    if (targetInput) {
      targetInput.focus();
      if (!item.group.formControl.isReadOnly()) {
        targetInput.click();
      }
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
    dataComponent: "radio-group",
    dataPart: "item-input",
    ref: item.inputRef,
    style: mergedStyle,
    onclick: handleClick,
    onchange: handleChange,
    onkeydown: handleKeyDown,
    onfocus: handleFocus,
    onblur: handleBlur,
    ...rest,
  } as SeidrElementProps<"input">);
}
