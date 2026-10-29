import type {
  DerivedValue,
  ObservableValue,
  ReactiveValue,
  Ref,
  SeidrChild,
  SeidrElementProps,
  SeidrElementTagNameMap,
} from "@fimbul-works/seidr";
import type { FormControlDescriptionProps } from "../form-control/form-control-description.js";
import type { FormControlErrorMessageProps } from "../form-control/form-control-error-message.js";
import type { FormControlLabelProps } from "../form-control/form-control-label.js";
import type { FormControlDataSet, UseFormControlOptions, UseFormControlResult } from "../form-control/types.js";

export type { ValidationState } from "../form-control/types.js";

export interface UseTextFieldOptions extends UseFormControlOptions {
  /** The controlled string value of the text field. */
  value?: ReactiveValue<string>;

  /** The default string value when initially rendered (uncontrolled). */
  defaultValue?: string;

  /** Event handler called when the value of the text field changes. */
  onChange?: (value: string) => void;
}

export interface UseTextFieldResult {
  /** The unique base identifier for the text field. */
  id: DerivedValue<string>;

  /** The form control name (or undefined). */
  name: DerivedValue<string | undefined>;

  /** The reactive string value of the text field. */
  value: DerivedValue<string>;

  /** Current raw text value getter. */
  getValue: () => string;

  /** Sets the text value (guarded against disabled and read-only). */
  setValue: (value: string) => void;

  /** Ref to the input element (if rendered). */
  inputRef: Ref<HTMLInputElement>;

  /** Ref to the textarea element (if rendered). */
  textAreaRef: Ref<HTMLTextAreaElement>;

  /** Ref to the root container element. */
  rootRef: Ref<HTMLElement>;

  /** Event handler to sync native input events to state. */
  onInput: (e: Event) => void;

  /** Underlying form control coordinator. */
  formControl: UseFormControlResult;

  /** Form control dataset (data-valid, data-invalid, data-required, data-disabled, data-readonly). */
  dataset: FormControlDataSet;

  /** Pre-composed reactive props ready to spread on the native input. */
  fieldProps: SeidrElementProps<"input">;
}

export interface TextFieldRootOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  /** The HTML tag to render. Defaults to "div". */
  as?: T;

  /** Explicit instance coordinator providing state. */
  instance?: UseTextFieldResult;

  /** Data component identifier. */
  dataComponent?: string;

  /** Data part identifier. */
  dataPart?: string;
}

export type TextFieldRootProps<T extends keyof SeidrElementTagNameMap = "div"> = TextFieldRootOptions<T> &
  Omit<SeidrElementProps<T>, "onChange">;

export interface TextFieldInputOptions<T extends keyof SeidrElementTagNameMap = "input"> {
  /** The HTML tag to render. Defaults to "input". */
  as?: T;

  /** Explicit instance coordinator providing state. */
  instance?: UseTextFieldResult;

  /** Optional explicit element id. */
  id?: ReactiveValue<string>;

  /** Native input type (defaults to "text"). */
  type?: string;

  /** Native input name attribute. */
  name?: ReactiveValue<string>;

  /** Controlled value of the input. */
  value?: ReactiveValue<string>;

  /** Whether the input is required. */
  required?: ReactiveValue<boolean>;

  /** Whether the input is disabled. */
  disabled?: ReactiveValue<boolean>;

  /** Whether the input is read-only. */
  readOnly?: ReactiveValue<boolean>;

  /** Alias for readOnly. */
  readonly?: ReactiveValue<boolean>;

  /** Data component identifier. */
  dataComponent?: string;

  /** Data part identifier. */
  dataPart?: string;

  ariaLabelledBy?: ReactiveValue<string>;
}

export type TextFieldInputProps<T extends keyof SeidrElementTagNameMap = "input"> = TextFieldInputOptions<T> &
  SeidrElementProps<T>;

export interface TextFieldTextAreaOptions<T extends keyof SeidrElementTagNameMap = "textarea"> {
  /** The HTML tag to render. Defaults to "textarea". */
  as?: T;

  /** Explicit instance coordinator providing state. */
  instance?: UseTextFieldResult;

  /** Optional explicit element id. */
  id?: ReactiveValue<string>;

  /** Native textarea name attribute. */
  name?: ReactiveValue<string>;

  /** Controlled value of the textarea. */
  value?: ReactiveValue<string>;

  /** Whether the textarea is required. */
  required?: ReactiveValue<boolean>;

  /** Whether the textarea is disabled. */
  disabled?: ReactiveValue<boolean>;

  /** Whether the textarea is read-only. */
  readOnly?: ReactiveValue<boolean>;

  /** Alias for readOnly. */
  readonly?: ReactiveValue<boolean>;

  /** Whether the textarea should adjust its height when the value changes. */
  autoResize?: boolean;

  /** Whether the form should be submitted when the user presses Enter without Shift. */
  submitOnEnter?: boolean;

  /** Data component identifier. */
  dataComponent?: string;

  /** Data part identifier. */
  dataPart?: string;
}

export type TextFieldTextAreaProps<T extends keyof SeidrElementTagNameMap = "textarea"> = TextFieldTextAreaOptions<T> &
  SeidrElementProps<T>;

export type TextFieldLabelProps<T extends keyof SeidrElementTagNameMap = "label"> = FormControlLabelProps<T> & {
  instance?: UseTextFieldResult;
};

export type TextFieldDescriptionProps<T extends keyof SeidrElementTagNameMap = "div"> =
  FormControlDescriptionProps<T> & { instance?: UseTextFieldResult };

export type TextFieldErrorMessageProps<T extends keyof SeidrElementTagNameMap = "div"> =
  FormControlErrorMessageProps<T> & { instance?: UseTextFieldResult };

export interface TextFieldInstance extends UseTextFieldResult {
  /** Pre-bound TextField.Root container element. */
  Root: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: Omit<TextFieldRootProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Pre-bound TextField.Label element. */
  Label: <T extends keyof SeidrElementTagNameMap = "label">(
    props?: Omit<TextFieldLabelProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Pre-bound TextField.Input single-line input element. */
  Input: <T extends keyof SeidrElementTagNameMap = "input">(
    props?: Omit<TextFieldInputProps<T>, "instance">,
  ) => SeidrElementTagNameMap[T];

  /** Pre-bound TextField.TextArea multi-line textarea element. */
  TextArea: <T extends keyof SeidrElementTagNameMap = "textarea">(
    props?: Omit<TextFieldTextAreaProps<T>, "instance">,
  ) => SeidrElementTagNameMap[T];

  /** Pre-bound TextField.Description element. */
  Description: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: Omit<TextFieldDescriptionProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Pre-bound TextField.ErrorMessage element. */
  ErrorMessage: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: Omit<TextFieldErrorMessageProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T] | ObservableValue<SeidrElementTagNameMap[T] | null>;
}

export interface TextFieldProps<T extends keyof SeidrElementTagNameMap = "div"> extends UseTextFieldOptions {
  /** The HTML tag to render for the root container. Defaults to "div". */
  as?: T;

  /** Visible label text or child element. */
  label?: SeidrChild;

  /** Visible description text or child element. */
  description?: SeidrChild;

  /** Visible error message text or child element. */
  errorMessage?: SeidrChild;

  /** Placeholder text for the input or textarea. */
  placeholder?: ReactiveValue<string>;

  /** Whether to render a multi-line textarea instead of a single-line input. */
  multiline?: boolean;

  /** Whether the textarea should auto-resize to its content height (multiline mode). */
  autoResize?: boolean;

  /** Whether pressing Enter submits the enclosing form (multiline mode). */
  submitOnEnter?: boolean;

  /** Props passed to the Root element. */
  rootProps?: Omit<TextFieldRootProps<T>, "instance">;

  /** Props passed to the Label element. */
  labelProps?: Omit<TextFieldLabelProps<"label">, "instance">;

  /** Props passed to the Input element (single-line mode). */
  inputProps?: Omit<TextFieldInputProps<"input">, "instance">;

  /** Props passed to the TextArea element (multiline mode). */
  textAreaProps?: Omit<TextFieldTextAreaProps<"textarea">, "instance">;

  /** Props passed to the Description element. */
  descriptionProps?: Omit<TextFieldDescriptionProps<"div">, "instance">;

  /** Props passed to the ErrorMessage element. */
  errorMessageProps?: Omit<TextFieldErrorMessageProps<"div">, "instance">;

  /** Additional child elements placed in the Root container. */
  children?: SeidrChild | SeidrChild[];
}
