import type {
  DerivedValue,
  ObservableValue,
  ReactiveValue,
  Ref,
  SeidrChild,
  SeidrElementProps,
  SeidrElementTagNameMap,
  Value,
} from "@fimbul-works/seidr";
import type { FormControlDescriptionProps } from "../form-control/form-control-description.js";
import type { FormControlErrorMessageProps } from "../form-control/form-control-error-message.js";
import type { FormControlLabelProps } from "../form-control/form-control-label.js";
import type { FormControlDataSet, UseFormControlOptions, UseFormControlResult } from "../form-control/types.js";
import type { SwitchControlProps } from "./switch-control.js";
import type { SwitchRootProps } from "./switch-root.js";
import type { SwitchThumbProps } from "./switch-thumb.js";

export interface SwitchDataSet {
  /** Applied when the switch is checked. Empty string if true, undefined if false. */
  "data-checked": ObservableValue<string | undefined>;
}

export type SwitchCombinedDataSet = SwitchDataSet & FormControlDataSet;

export interface UseSwitchOptions extends UseFormControlOptions {
  /** The controlled checked state of the switch. */
  checked?: ReactiveValue<boolean>;

  /** The default checked state when initially rendered (uncontrolled). */
  defaultChecked?: boolean;

  /** Event handler called when the checked state changes. */
  onChange?: (checked: boolean) => void;

  /**
   * The value of the switch submitted with an HTML form.
   * Defaults to "on".
   */
  value?: ReactiveValue<string>;
}

export interface UseSwitchResult {
  /** The root ID of the switch. */
  id: DerivedValue<string>;

  /** The form submission value (defaults to "on"). */
  value: DerivedValue<string>;

  /** Reactive boolean indicating whether the switch is checked. */
  checked: DerivedValue<boolean>;

  /** Helper getter returning current checked state as a boolean. */
  isChecked: () => boolean;

  /** Reactive boolean indicating whether the native input is focused. */
  isFocused: Value<boolean>;

  /** Toggles the checked state if not disabled or read-only. */
  toggle: () => void;

  /** Explicitly sets the checked state if not disabled or read-only. */
  setChecked: (newChecked: boolean) => void;

  /** Reference to the hidden native `<input>` element. */
  inputRef: Ref<HTMLInputElement>;

  /** Reference to the root container element. */
  rootRef: Ref<HTMLElement>;

  /** Reference to the visual control track element. */
  controlRef: Ref<HTMLElement>;

  /** Reference to the sliding thumb element. */
  thumbRef: Ref<HTMLElement>;

  /** Underlying form control instance managing labeling, description, and validation. */
  formControl: UseFormControlResult;

  /** Combined reactive data-* attributes for Switch and FormControl. */
  dataset: SwitchCombinedDataSet;

  /** Attributes and ARIA bindings to apply to the native input element. */
  fieldProps: SeidrElementProps<"input">;
}

export interface SwitchInstance extends UseSwitchResult {
  /** Pre-bound Switch.Root container. */
  Root: <T extends keyof SeidrElementTagNameMap = "div">(
    propsOrChildren?: SwitchRootProps<T> | SeidrChild | SeidrChild[],
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Pre-bound Switch.Input native hidden element. */
  Input: (props?: SeidrElementProps<"input">) => HTMLInputElement;

  /** Pre-bound Switch.Control visual track element. */
  Control: <T extends keyof SeidrElementTagNameMap = "div">(
    propsOrChildren?: SwitchControlProps<T> | SeidrChild | SeidrChild[],
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Pre-bound Switch.Thumb sliding thumb element. */
  Thumb: <T extends keyof SeidrElementTagNameMap = "div">(
    propsOrChildren?: SwitchThumbProps<T> | SeidrChild | SeidrChild[],
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Pre-bound Switch.Label element. */
  Label: <T extends keyof SeidrElementTagNameMap = "label">(
    propsOrChildren?: FormControlLabelProps<T> | SeidrChild | SeidrChild[],
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Pre-bound Switch.Description element. */
  Description: <T extends keyof SeidrElementTagNameMap = "div">(
    propsOrChildren?: FormControlDescriptionProps<T> | SeidrChild | SeidrChild[],
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Pre-bound Switch.ErrorMessage element. */
  ErrorMessage: <T extends keyof SeidrElementTagNameMap = "div">(
    propsOrChildren?: FormControlErrorMessageProps<T> | SeidrChild | SeidrChild[],
    children?: SeidrChild | SeidrChild[],
  ) => DerivedValue<SeidrElementTagNameMap[T] | null>;
}
