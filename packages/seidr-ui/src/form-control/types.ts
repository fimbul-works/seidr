import type { CleanupFunction, Value } from "@fimbul-works/seidr";

export type ValidationState = "valid" | "invalid";

export interface FormControlDataSet {
  "data-valid": Value<string | undefined>;
  "data-invalid": Value<string | undefined>;
  "data-required": Value<string | undefined>;
  "data-disabled": Value<string | undefined>;
  "data-readonly": Value<string | undefined>;
}

export interface UseFormControlOptions {
  /** Base identifier for the form control. Defaults to auto-generated ID. */
  id?: string;

  /** Name of the form control submitted with form. Defaults to id. */
  name?: string | Value<string>;

  /** Validation state: "valid" | "invalid" | undefined. */
  validationState?: ValidationState | Value<ValidationState | undefined>;

  /** Whether the field is required. */
  required?: boolean | Value<boolean>;

  /** Whether the field is disabled. */
  disabled?: boolean | Value<boolean>;

  /** Whether the field is read-only. */
  readOnly?: boolean | Value<boolean>;

  /** Optional explicit field identifier. */
  fieldId?: string;
}

export interface UseFormControlResult {
  /** Base identifier for the form control. */
  id: string;

  /** The form control name. */
  name: Value<string>;

  /** The current validation state ("valid" | "invalid" | undefined). */
  validationState: Value<ValidationState | undefined>;

  /** Whether the form control is currently invalid. */
  isInvalid: Value<boolean>;

  /** Whether the form control is currently valid. */
  isValid: Value<boolean>;

  /** Whether the form control is required. */
  isRequired: Value<boolean>;

  /** Whether the form control is disabled. */
  isDisabled: Value<boolean>;

  /** Whether the form control is read-only. */
  isReadOnly: Value<boolean>;

  /** The reactive field element ID. */
  fieldId: Value<string>;

  /** The reactive label element ID. */
  labelId: Value<string | undefined>;

  /** The reactive description element ID. */
  descriptionId: Value<string | undefined>;

  /** The reactive error message element ID. */
  errorMessageId: Value<string | undefined>;

  /** Registers or overrides the label ID. Returns a cleanup function. */
  registerLabel: (id: string) => CleanupFunction;

  /** Registers or overrides the field ID. Returns a cleanup function. */
  registerField: (id: string) => CleanupFunction;

  /** Registers or overrides the description ID. Returns a cleanup function. */
  registerDescription: (id: string) => CleanupFunction;

  /** Registers or overrides the error message ID. Returns a cleanup function. */
  registerErrorMessage: (id: string) => CleanupFunction;

  /** Space-separated reactive aria-labelledby string. */
  ariaLabelledBy: Value<string | undefined>;

  /** Space-separated reactive aria-describedby string (auto-incorporates error message when invalid). */
  ariaDescribedBy: Value<string | undefined>;

  /** Reactive data-* attributes for Root, Label, Description, ErrorMessage, and Field. */
  dataset: FormControlDataSet;

  /** Pre-composed reactive props ready to spread onto any native input or custom form field. */
  fieldProps: Record<string, any>;
}
