import type { Ref, SeidrChild, SeidrElementTagNameMap, Value } from "@fimbul-works/seidr";
import type { FormControlDataSet, UseFormControlOptions, UseFormControlResult } from "../form-control/types.js";

export interface CheckboxDataSet {
  "data-checked": Value<string | undefined>;
  "data-indeterminate": Value<string | undefined>;
}

export type CheckboxCombinedDataSet = CheckboxDataSet & FormControlDataSet;

export interface UseCheckboxOptions extends UseFormControlOptions {
  /** The controlled checked state of the checkbox. */
  checked?: boolean | Value<boolean>;

  /** The default checked state when initially rendered (uncontrolled). */
  defaultChecked?: boolean;

  /** Event handler called when the checked state changes. */
  onChange?: (checked: boolean) => void;

  /**
   * Whether the checkbox is in an indeterminate state.
   * Indeterminism is presentational: clicking toggles checked state while indicator remains active.
   */
  indeterminate?: boolean | Value<boolean>;

  /**
   * The value of the checkbox submitted with an HTML form.
   * Defaults to "on".
   */
  value?: string | Value<string>;
}

export interface UseCheckboxResult {
  /** The unique base identifier for the checkbox. */
  id: string;

  /** The form submission value (defaults to "on"). */
  value: Value<string>;

  /** The reactive checked boolean state. */
  checked: Value<boolean>;

  /** The reactive indeterminate boolean state. */
  indeterminate: Value<boolean>;

  /** Returns whether the checkbox is currently checked. */
  isChecked: () => boolean;

  /** Returns whether the checkbox is currently indeterminate. */
  isIndeterminate: () => boolean;

  /** Whether the checkbox or hidden input currently has focus. */
  isFocused: Value<boolean>;

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
  fieldProps: Record<string, any>;
}

export interface CheckboxInstance extends UseCheckboxResult {
  /** Pre-bound Checkbox.Root container. */
  Root: <T extends keyof SeidrElementTagNameMap = "div">(
    propsOrChildren?: any,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Pre-bound Checkbox.Input element. */
  Input: (props?: any) => HTMLInputElement;

  /** Pre-bound Checkbox.Control visual box. */
  Control: <T extends keyof SeidrElementTagNameMap = "div">(
    propsOrChildren?: any,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Pre-bound Checkbox.Indicator checkmark. */
  Indicator: <T extends keyof SeidrElementTagNameMap = "div">(
    propsOrChildren?: any,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T] | Value<SeidrElementTagNameMap[T] | null>;

  /** Pre-bound Checkbox.Label element. */
  Label: <T extends keyof SeidrElementTagNameMap = "label">(
    propsOrChildren?: any,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Pre-bound Checkbox.Description element. */
  Description: <T extends keyof SeidrElementTagNameMap = "div">(
    propsOrChildren?: any,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Pre-bound Checkbox.ErrorMessage element. */
  ErrorMessage: <T extends keyof SeidrElementTagNameMap = "div">(
    propsOrChildren?: any,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T] | Value<SeidrElementTagNameMap[T] | null>;
}
