import { type CleanupFunction, createValue, isValue, mergeValues, useId, type Value } from "@fimbul-works/seidr";
import type { FormControlDataSet, UseFormControlOptions, UseFormControlResult, ValidationState } from "./types.js";

/**
 * Creates a unique ID for a form control.
 * @param prefix - The prefix to use for the ID.
 * @returns A unique ID for a form control.
 */
export const createFormControlId = (prefix = "form-control"): string => useId(prefix);

/**
 * Headless hook that provides state management, accessibility coordination,
 * and ARIA wiring for a form control.
 */
export function useFormControl(options: UseFormControlOptions = {}): UseFormControlResult {
  const {
    id: providedId,
    name: providedName,
    validationState: providedValidationState,
    required,
    disabled,
    readOnly,
    fieldId: providedFieldId,
  } = options;

  const id = providedId ?? createFormControlId();

  const name = isValue(providedName)
    ? (providedName.as((n) => n ?? id) as Value<string>)
    : createValue<string>((providedName as string | undefined) ?? id);

  const validationState = isValue(providedValidationState)
    ? (providedValidationState as Value<ValidationState | undefined>)
    : createValue<ValidationState | undefined>(providedValidationState as ValidationState | undefined);

  const isInvalid = validationState.as((s) => s === "invalid");
  const isValid = validationState.as((s) => s === "valid");

  const isRequired = isValue(required)
    ? (required.as((r) => Boolean(r)) as Value<boolean>)
    : createValue(Boolean(required));

  const isDisabled = isValue(disabled)
    ? (disabled.as((d) => Boolean(d)) as Value<boolean>)
    : createValue(Boolean(disabled));

  const isReadOnly = isValue(readOnly)
    ? (readOnly.as((ro) => Boolean(ro)) as Value<boolean>)
    : createValue(Boolean(readOnly));

  const fieldId = createValue<string>(providedFieldId ?? `${id}-field`);
  const labelId = createValue<string | undefined>(undefined);
  const descriptionId = createValue<string | undefined>(undefined);
  const errorMessageId = createValue<string | undefined>(undefined);

  const registerLabel = (newId: string): CleanupFunction => {
    labelId(newId);
    return () => {
      if (labelId() === newId) {
        labelId(undefined);
      }
    };
  };

  const registerField = (newId: string): CleanupFunction => {
    fieldId(newId);
    return () => {
      if (fieldId() === newId) {
        fieldId(providedFieldId ?? `${id}-field`);
      }
    };
  };

  const registerDescription = (newId: string): CleanupFunction => {
    descriptionId(newId);
    return () => {
      if (descriptionId() === newId) {
        descriptionId(undefined);
      }
    };
  };

  const registerErrorMessage = (newId: string): CleanupFunction => {
    errorMessageId(newId);
    return () => {
      if (errorMessageId() === newId) {
        errorMessageId(undefined);
      }
    };
  };

  const ariaLabelledBy = labelId.as((lid) => lid ?? undefined);

  const ariaDescribedBy = mergeValues(
    () => {
      const parts: string[] = [];
      const descId = descriptionId();
      if (descId) parts.push(descId);
      if (isInvalid()) {
        const errId = errorMessageId();
        if (errId) parts.push(errId);
      }
      return parts.length > 0 ? parts.join(" ") : undefined;
    },
    { parents: [descriptionId, isInvalid, errorMessageId] },
  );

  const dataset: FormControlDataSet = {
    "data-valid": validationState.as((s) => (s === "valid" ? "" : undefined)),
    "data-invalid": validationState.as((s) => (s === "invalid" ? "" : undefined)),
    "data-required": isRequired.as((r) => (r ? "" : undefined)),
    "data-disabled": isDisabled.as((d) => (d ? "" : undefined)),
    "data-readonly": isReadOnly.as((ro) => (ro ? "" : undefined)),
  };

  const fieldProps: Record<string, any> = {
    id: fieldId,
    name,
    required: isRequired,
    disabled: isDisabled,
    readOnly: isReadOnly,
    "aria-invalid": isInvalid.as((inv) => (inv ? "true" : undefined)),
    "aria-required": isRequired.as((req) => (req ? "true" : undefined)),
    "aria-disabled": isDisabled.as((dis) => (dis ? "true" : undefined)),
    "aria-readonly": isReadOnly.as((ro) => (ro ? "true" : undefined)),
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
    ...dataset,
  };

  return {
    id,
    name,
    validationState,
    isInvalid,
    isValid,
    isRequired,
    isDisabled,
    isReadOnly,
    fieldId,
    labelId,
    descriptionId,
    errorMessageId,
    registerLabel,
    registerField,
    registerDescription,
    registerErrorMessage,
    ariaLabelledBy,
    ariaDescribedBy,
    dataset,
    fieldProps,
  };
}
