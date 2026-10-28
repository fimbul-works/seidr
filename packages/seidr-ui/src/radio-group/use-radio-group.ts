import { createRef, type ReactiveARIAMixin, useId, wrapValue } from "@fimbul-works/seidr";
import { useFormControl } from "../form-control/use-form-control.js";
import { useControllableValue } from "../hooks/use-controllable-value.js";
import { useFormResetListener } from "../hooks/use-form-reset-listener.js";
import type { RadioGroupDataSet, UseRadioGroupOptions, UseRadioGroupResult } from "./types.js";

/**
 * Headless hook providing reactive state, WAI-ARIA coordination, and form control
 * bindings for an accessible RadioGroup component.
 */
export function useRadioGroup(options: UseRadioGroupOptions = {}): UseRadioGroupResult {
  const id = wrapValue(options.id ?? useId("radiogroup"));
  const orientation = options.orientation ?? "vertical";

  const formControl = useFormControl({
    id,
    name: options.name,
    validationState: options.validationState,
    required: options.required,
    disabled: options.disabled,
    readOnly: options.readOnly,
  });

  const internalState = useControllableValue<string>({
    value: options.value,
    defaultValue: options.defaultValue ?? "",
    onChange: options.onChange,
  });

  const rootRef = createRef<HTMLElement>();

  const isBlocked = () => formControl.isReadOnly() || formControl.isDisabled();

  const isDefaultValue = (val: string) => val === (options.defaultValue ?? "");
  const isSelectedValue = (val: string) => val === internalState();

  const setSelectedValue = (newValue: string) => {
    if (isBlocked()) {
      return;
    }

    internalState(newValue);

    // Synchronize native input elements if present in DOM
    const root = rootRef();
    if (root) {
      const inputs = root.querySelectorAll("input");
      for (const el of inputs) {
        const radio = el as HTMLInputElement;
        if (radio.type === "radio") {
          radio.checked = radio.value === newValue;
        }
      }
    }
  };

  // When form resets, restore initial default value
  useFormResetListener(rootRef, () => {
    setSelectedValue(options.defaultValue ?? "");
  });

  const dataset: RadioGroupDataSet = {
    ...formControl.dataset,
  };

  const ariaProps: ReactiveARIAMixin = {
    role: "radiogroup",
    "aria-orientation": orientation,
    "aria-invalid": formControl.isInvalid.as((v) => (v ? "true" : undefined)),
    "aria-required": formControl.isRequired.as((v) => (v ? "true" : undefined)),
    "aria-disabled": formControl.isDisabled.as((v) => (v ? "true" : undefined)),
    "aria-readonly": formControl.isReadOnly.as((v) => (v ? "true" : undefined)),
    "aria-labelledby": formControl.ariaLabelledBy,
    "aria-describedby": formControl.ariaDescribedBy,
  };

  return {
    id: formControl.id,
    name: formControl.name,
    value: internalState.as((v) => v),
    selectedValue: () => internalState(),
    orientation,
    setSelectedValue,
    isDefaultValue,
    isSelectedValue,
    rootRef,
    formControl,
    dataset,
    ariaProps,
  };
}
