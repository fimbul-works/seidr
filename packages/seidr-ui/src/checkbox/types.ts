import type {
  DerivedValue,
  ObservableValue,
  ReactiveValue,
  Ref,
  SeidrChild,
  SeidrElementProps,
  SeidrElementTagNameMap,
} from "@fimbul-works/seidr";
import type { FormControlLabelProps } from "../form-control/form-control-label.js";
import type { FormControlDataSet, UseFormControlOptions, UseFormControlResult } from "../form-control/types.js";
import type { CheckboxControlProps } from "./checkbox-control.js";
import type { CheckboxDescriptionProps } from "./checkbox-description.js";
import type { CheckboxErrorMessageProps } from "./checkbox-error-message.js";
import type { CheckboxIndicatorProps } from "./checkbox-indicator.js";
import type { CheckboxRootProps } from "./checkbox-root.js";

export interface CheckboxDataSet {
  "data-checked": ObservableValue<string | undefined>;
  "data-indeterminate": ObservableValue<string | undefined>;
}

export type CheckboxCombinedDataSet = CheckboxDataSet & FormControlDataSet;

export interface UseCheckboxOptions extends UseFormControlOptions {
  /** The controlled checked state of the checkbox. */
  checked?: ReactiveValue<boolean>;

  /** The default checked state when initially rendered (uncontrolled). */
  defaultChecked?: boolean;

  /** Event handler called when the checked state changes. */
  onChange?: (checked: boolean) => void;

  /**
   * Whether the checkbox is in an indeterminate state.
   * Indeterminism is presentational: clicking toggles checked state while indicator remains active.
   */
  indeterminate?: ReactiveValue<boolean>;

  /**
   * The value of the checkbox submitted with an HTML form.
   * Defaults to "on".
   */
  value?: ReactiveValue<string>;
}

export interface UseCheckboxResult {
  /** The unique base identifier for the checkbox. */
  id: DerivedValue<string>;

  /** The form submission value (defaults to "on"). */
  value: DerivedValue<string>;

  /** The reactive checked boolean state. */
  checked: DerivedValue<boolean>;

  /** The reactive indeterminate boolean state. */
  indeterminate: ObservableValue<boolean>;

  /** Returns whether the checkbox is currently checked. */
  isChecked: () => boolean;

  /** Returns whether the checkbox is currently indeterminate. */
  isIndeterminate: () => boolean;

  /** Whether the checkbox or hidden input currently has focus. */
  isFocused: ObservableValue<boolean>;

  /** Toggles the checked state (respecting disabled and read-only guards). */
  toggle: () => void;

  /** Sets the checked state (respecting disabled and read-only guards). */
  setChecked: (checked: boolean) => void;

  /** Ref to the native hidden HTMLInputElement. */
  inputRef: Ref<HTMLInputElement>;

  /** Ref to the outer root container element. */
  rootRef: Ref<HTMLElement>;

  /** Ref to the visible control element. */
  controlRef: Ref<HTMLElement>;

  /** Underlying form control coordinator. */
  formControl: UseFormControlResult;

  /** Combined reactive data-* attributes for Checkbox and FormControl. */
  dataset: CheckboxCombinedDataSet;

  /** Pre-composed props ready to spread on the native input. */
  fieldProps: SeidrElementProps<"input">;
}

export interface CheckboxInstance extends UseCheckboxResult {
  /** Pre-bound Checkbox.Root container. */
  Root: <T extends keyof SeidrElementTagNameMap = "div">(
    props: CheckboxRootProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Pre-bound Checkbox.Input element. */
  Input: (props: SeidrElementProps<"input">) => HTMLInputElement;

  /** Pre-bound Checkbox.Control visual box. */
  Control: <T extends keyof SeidrElementTagNameMap = "div">(
    props: CheckboxControlProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Pre-bound Checkbox.Indicator checkmark. */
  Indicator: <T extends keyof SeidrElementTagNameMap = "div">(
    props: CheckboxIndicatorProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T] | ObservableValue<SeidrElementTagNameMap[T] | null>;

  /** Pre-bound Checkbox.Label element. */
  Label: <T extends keyof SeidrElementTagNameMap = "label">(
    props: FormControlLabelProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Pre-bound Checkbox.Description element. */
  Description: <T extends keyof SeidrElementTagNameMap = "div">(
    props: CheckboxDescriptionProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Pre-bound Checkbox.ErrorMessage element. */
  ErrorMessage: <T extends keyof SeidrElementTagNameMap = "div">(
    props: CheckboxErrorMessageProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T] | ObservableValue<SeidrElementTagNameMap[T] | null>;
}
