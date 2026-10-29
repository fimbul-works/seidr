import {
  createRef,
  createValue,
  type DerivedValue,
  type ObservableValue,
  type SeidrElementProps,
  useId,
  wrapValue,
} from "@fimbul-works/seidr";
import { useFormControl } from "../form-control/use-form-control.js";
import { useFormResetListener } from "../hooks/use-form-reset-listener.js";
import type { UseTextFieldOptions, UseTextFieldResult } from "./types.js";

/**
 * Headless coordinator hook providing reactive state, accessibility bindings,
 * and form control integration for an accessible TextField component.
 */
export function useTextField(options: UseTextFieldOptions = {}): UseTextFieldResult {
  const baseId = wrapValue(options.id ?? useId("textfield"));

  const formControl = useFormControl({
    id: baseId,
    name: options.name,
    validationState: options.validationState,
    required: options.required,
    disabled: options.disabled,
    readOnly: options.readOnly,
    fieldId: options.fieldId ?? baseId.as((i) => `${i}-field`),
  });

  const isControlled = options.value !== undefined;
  const internalValue = createValue(options.defaultValue ?? "");
  const valueObservable: ObservableValue<string> = isControlled ? wrapValue(options.value as string) : internalValue;

  const inputRef = createRef<HTMLInputElement>();
  const textAreaRef = createRef<HTMLTextAreaElement>();
  const rootRef = createRef<HTMLElement>();

  const getValue = (): string => valueObservable();

  const setValue = (nextValue: string): void => {
    if (formControl.isDisabled() || formControl.isReadOnly()) {
      return;
    }

    if (!isControlled) {
      internalValue(nextValue);
    } else if (isControlled) {
      try {
        (options.value as (val: string) => void)(nextValue);
      } catch {
        // Ignored if observable is read-only
      }
    }

    options.onChange?.(nextValue);
  };

  const onInput = (e: Event): void => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement | null;
    if (!target) return;

    if (formControl.isDisabled() || formControl.isReadOnly()) {
      target.value = getValue();
      return;
    }

    const next = target.value;
    setValue(next);

    // Keep native input's value in sync with state in case controlled value was not mutated
    target.value = getValue();
  };

  // Form reset restores initial default value
  useFormResetListener(rootRef, () => {
    setValue(options.defaultValue ?? "");
  });

  const readOnlyValue: DerivedValue<string> = valueObservable.as((v) => v);

  const fieldProps: SeidrElementProps<"input"> = {
    ...formControl.fieldProps,
    value: readOnlyValue,
  };

  return {
    id: formControl.id,
    name: formControl.name,
    value: readOnlyValue,
    getValue,
    setValue,
    inputRef,
    textAreaRef,
    rootRef,
    onInput,
    formControl,
    dataset: formControl.dataset,
    fieldProps,
  };
}
