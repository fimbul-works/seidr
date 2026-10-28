import { isTruthy } from "@fimbul-works/hvat";
import {
  type CleanupFunction,
  createValue,
  mergeValues,
  type ObservableValue,
  type ReactiveValue,
  type SeidrElementProps,
  unwrapValue,
  useId,
  wrapValue,
} from "@fimbul-works/seidr";
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

  const id = wrapValue(providedId ?? createFormControlId());
  const name = wrapValue(providedName as string | undefined).as((v) => v);

  const validationState = providedValidationState
    ? providedValidationState.as<ValidationState | undefined>((s) => s)
    : createValue<ValidationState | undefined>(undefined);
  const isInvalid = validationState.as((s) => s === "invalid");
  const isValid = validationState.as((s) => s === "valid");

  const isRequired = wrapValue(required ?? false).as((r) => Boolean(r));
  const isDisabled = wrapValue(disabled ?? false).as((d) => Boolean(d));
  const isReadOnly = wrapValue(readOnly ?? false).as((ro) => Boolean(ro));

  const defaultFieldId = providedFieldId ?? id.as((bid) => `${bid}-field`);
  const customFieldId = createValue<string | undefined>(undefined);
  const fieldId = mergeValues(() => customFieldId() ?? unwrapValue(defaultFieldId), {
    parents: [customFieldId, defaultFieldId],
  });

  const labelId = createValue<string | undefined>(undefined);
  const descriptionId = createValue<string | undefined>(undefined);
  const errorMessageId = createValue<string | undefined>(undefined);

  const registerLabel = (newId: ReactiveValue<string> | ObservableValue<string | undefined>): CleanupFunction => {
    const wrappedId = wrapValue(newId as any);
    return wrappedId.bind((val) => {
      labelId(val);
      return () => {
        labelId(undefined);
      };
    });
  };

  const registerField = (newId: ReactiveValue<string> | ObservableValue<string | undefined>): CleanupFunction => {
    const wrappedId = wrapValue(newId as any);
    return wrappedId.bind((val) => {
      customFieldId(val);
      return () => {
        customFieldId(undefined);
      };
    });
  };

  const registerDescription = (newId: ReactiveValue<string> | ObservableValue<string | undefined>): CleanupFunction => {
    const wrappedId = wrapValue(newId as any);
    return wrappedId.bind((val) => {
      descriptionId(val);
      return () => {
        descriptionId(undefined);
      };
    });
  };

  const registerErrorMessage = (
    newId: ReactiveValue<string> | ObservableValue<string | undefined>,
  ): CleanupFunction => {
    const wrappedId = wrapValue(newId as any);
    return wrappedId.bind((val) => {
      errorMessageId(val);
      return () => {
        errorMessageId(undefined);
      };
    });
  };

  const ariaLabelledBy = labelId.as((lid) => lid ?? undefined);

  const ariaDescribedBy = mergeValues(
    () => {
      const parts = [descriptionId(), isInvalid() && errorMessageId()].filter(isTruthy);
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

  const fieldProps: SeidrElementProps<"input"> = {
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
    id: id.as((id) => id),
    name,
    validationState,
    isInvalid,
    isValid,
    isRequired,
    isDisabled,
    isReadOnly,
    fieldId,
    labelId: labelId.as((id) => id),
    descriptionId: descriptionId.as((id) => id),
    errorMessageId: errorMessageId.as((id) => id),
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
