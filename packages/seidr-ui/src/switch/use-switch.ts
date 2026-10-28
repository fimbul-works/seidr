import { createRef, createValue, type SeidrElementProps, useId, wrapValue } from "@fimbul-works/seidr";
import { useFormControl } from "../form-control/use-form-control.js";
import { useFormResetListener } from "../hooks/use-form-reset-listener.js";
import { useToggleState } from "../hooks/use-toggle-state.js";
import type { SwitchCombinedDataSet, SwitchDataSet, UseSwitchOptions, UseSwitchResult } from "./types.js";

/**
 * Headless hook providing reactive state, accessibility bindings, and form integration
 * for an accessible Switch component.
 */
export function useSwitch(options: UseSwitchOptions = {}): UseSwitchResult {
  const baseId = wrapValue(options.id ?? useId("switch"));

  const formControl = useFormControl({
    id: baseId,
    name: options.name,
    validationState: options.validationState,
    required: options.required,
    disabled: options.disabled,
    readOnly: options.readOnly,
    fieldId: options.fieldId ?? baseId.as((i) => `${i}-input`),
  });

  const value = wrapValue(options.value ?? "on");

  const toggleState = useToggleState({
    isSelected: options.checked,
    defaultIsSelected: options.defaultChecked ?? false,
    isDisabled: formControl.isDisabled,
    isReadOnly: formControl.isReadOnly,
    onSelectedChange: options.onChange ? (val: boolean) => options.onChange?.(val) : undefined,
  });

  const inputRef = createRef<HTMLInputElement>();
  const rootRef = createRef<HTMLElement>();
  const controlRef = createRef<HTMLElement>();
  const thumbRef = createRef<HTMLElement>();
  const isFocused = createValue(false);

  // Form reset restores initial default checked value
  useFormResetListener(rootRef, () => {
    toggleState.setIsSelected(options.defaultChecked ?? false);
  });

  const switchDataset: SwitchDataSet = {
    "data-checked": toggleState.isSelected.as((v) => (v ? "" : undefined)),
  };

  const dataset: SwitchCombinedDataSet = {
    ...formControl.dataset,
    ...switchDataset,
  };

  const fieldProps: SeidrElementProps<"input"> = {
    ...formControl.fieldProps,
    type: "checkbox",
    role: "switch",
    value,
    checked: toggleState.isSelected,
    "aria-checked": toggleState.isSelected.as((v) => String(v)),
    ...switchDataset,
  };

  return {
    id: formControl.id,
    value: value.as((v) => v),
    checked: toggleState.isSelected,
    isChecked: () => toggleState.isSelected(),
    isFocused,
    toggle: () => toggleState.toggle(),
    setChecked: (newChecked: boolean) => toggleState.setIsSelected(newChecked),
    inputRef,
    rootRef,
    controlRef,
    thumbRef,
    formControl,
    dataset,
    fieldProps,
  };
}
