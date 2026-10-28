import { createRef, createValue, inClient, onMounted, type SeidrElementProps, useId, wrapValue } from "@fimbul-works/seidr";
import { useFormControl } from "../form-control/use-form-control.js";
import { useFormResetListener } from "../hooks/use-form-reset-listener.js";
import { useToggleState } from "../hooks/use-toggle-state.js";
import type { CheckboxCombinedDataSet, CheckboxDataSet, UseCheckboxOptions, UseCheckboxResult } from "./types.js";

/**
 * Headless hook providing reactive state, accessibility bindings, and form integration
 * for an accessible Checkbox component.
 */
export function useCheckbox(options: UseCheckboxOptions = {}): UseCheckboxResult {
  const baseId = wrapValue(options.id ?? useId("checkbox"));

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
  const indeterminate = wrapValue(options.indeterminate ?? false);

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
  const isFocused = createValue(false);

  // Form reset restores initial default checked value
  useFormResetListener(rootRef, () => {
    toggleState.setIsSelected(options.defaultChecked ?? false);
  });

  inClient(() => {
    // Keep native input's JavaScript .indeterminate property synchronized in the browser
    const syncIndeterminate = () => {
      const input = inputRef();
      if (input) {
        input.indeterminate = indeterminate();
      }
    };

    indeterminate.watch(() => syncIndeterminate());
    toggleState.isSelected.watch(() => syncIndeterminate());
    onMounted(() => syncIndeterminate());
  });

  const checkboxDataset: CheckboxDataSet = {
    "data-checked": toggleState.isSelected.as((v) => (v ? "" : undefined)),
    "data-indeterminate": indeterminate.as((v) => (v ? "" : undefined)),
  };

  const dataset: CheckboxCombinedDataSet = {
    ...formControl.dataset,
    ...checkboxDataset,
  };

  const fieldProps: SeidrElementProps<"input"> = {
    ...formControl.fieldProps,
    type: "checkbox",
    value,
    checked: toggleState.isSelected,
    ...checkboxDataset,
  };

  return {
    id: formControl.id,
    value: value.as((v) => v),
    checked: toggleState.isSelected,
    indeterminate,
    isChecked: () => toggleState.isSelected(),
    isIndeterminate: () => indeterminate(),
    isFocused,
    toggle: () => toggleState.toggle(),
    setChecked: (newChecked: boolean) => toggleState.setIsSelected(newChecked),
    inputRef,
    rootRef,
    controlRef,
    formControl,
    dataset,
    fieldProps,
  };
}
