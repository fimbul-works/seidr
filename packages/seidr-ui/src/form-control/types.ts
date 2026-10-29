import type {
  CleanupFunction,
  DerivedValue,
  ObservableValue,
  ReactiveValue,
  SeidrElementProps,
} from "@fimbul-works/seidr";

export type ValidationState = "valid" | "invalid";

export interface FormControlDataSet {
  "data-valid": ObservableValue<string | undefined>;
  "data-invalid": ObservableValue<string | undefined>;
  "data-required": ObservableValue<string | undefined>;
  "data-disabled": ObservableValue<string | undefined>;
  "data-readonly": ObservableValue<string | undefined>;
}

export interface UseFormControlOptions {
  /** Base identifier for the form control. Defaults to auto-generated ID. */
  id?: ReactiveValue<string>;

  /** Name of the form control submitted with form. Defaults to undefined. */
  name?: ReactiveValue<string>;

  /** Validation state: "valid" | "invalid" | undefined. */
  validationState?: ReactiveValue<ValidationState | undefined>;

  /** Whether the field is required. */
  required?: ReactiveValue<boolean>;

  /** Whether the field is disabled. */
  disabled?: ReactiveValue<boolean>;

  /** Whether the field is read-only. */
  readOnly?: ReactiveValue<boolean>;

  /** Optional explicit field identifier. */
  fieldId?: ReactiveValue<string>;
}

export interface UseFormControlResult {
  /** Base identifier for the form control. */
  id: DerivedValue<string>;

  /** The form control name (or undefined). */
  name: DerivedValue<string | undefined>;

  /** The current validation state ("valid" | "invalid" | undefined). */
  validationState: ObservableValue<ValidationState | undefined>;

  /** Whether the form control is currently invalid. */
  isInvalid: ObservableValue<boolean>;

  /** Whether the form control is currently valid. */
  isValid: ObservableValue<boolean>;

  /** Whether the form control is required. */
  isRequired: ObservableValue<boolean>;

  /** Whether the form control is disabled. */
  isDisabled: ObservableValue<boolean>;

  /** Whether the form control is read-only. */
  isReadOnly: ObservableValue<boolean>;

  /** The reactive field element ID. */
  fieldId: DerivedValue<string>;

  /** The reactive label element ID. */
  labelId: DerivedValue<string | undefined>;

  /** The reactive description element ID. */
  descriptionId: DerivedValue<string | undefined>;

  /** The reactive error message element ID. */
  errorMessageId: DerivedValue<string | undefined>;

  /** Registers or overrides the label ID. Returns a cleanup function. */
  registerLabel: (id: ReactiveValue<string> | ObservableValue<string | undefined>) => CleanupFunction;

  /** Registers or overrides the field ID. Returns a cleanup function. */
  registerField: (id: ReactiveValue<string> | ObservableValue<string | undefined>) => CleanupFunction;

  /** Registers or overrides the description ID. Returns a cleanup function. */
  registerDescription: (id: ReactiveValue<string> | ObservableValue<string | undefined>) => CleanupFunction;

  /** Registers or overrides the error message ID. Returns a cleanup function. */
  registerErrorMessage: (id: ReactiveValue<string> | ObservableValue<string | undefined>) => CleanupFunction;

  /** Space-separated reactive aria-labelledby string. */
  ariaLabelledBy: DerivedValue<string | undefined>;

  /** Space-separated reactive aria-describedby string (auto-incorporates error message when invalid). */
  ariaDescribedBy: DerivedValue<string | undefined>;

  /** Reactive data-* attributes for Root, Label, Description, ErrorMessage, and Field. */
  dataset: FormControlDataSet;

  /** Pre-composed reactive props ready to spread onto any native input or custom form field. */
  fieldProps: SeidrElementProps<"input">;
}
