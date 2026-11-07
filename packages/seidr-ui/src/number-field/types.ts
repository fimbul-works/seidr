import type {
  DerivedValue,
  ObservableValue,
  ReactiveValue,
  Ref,
  SeidrChild,
  SeidrElementProps,
  SeidrElementTagNameMap,
} from "@fimbul-works/seidr";
import type { FormControlDataSet, UseFormControlOptions, UseFormControlResult } from "../form-control/types.js";

export interface NumberFieldDataSet extends FormControlDataSet {}

export interface UseNumberFieldOptions extends UseFormControlOptions {
  /** The controlled formatted or raw string/numeric value of the number field. */
  value?: ReactiveValue<string | number>;

  /**
   * The default value when initially rendered (uncontrolled).
   * @default undefined
   */
  defaultValue?: string | number;

  /** Event handler called when the formatted text value changes. */
  onChange?: (value: string) => void;

  /** The controlled raw numeric value of the number field. */
  rawValue?: ReactiveValue<number | undefined>;

  /** Event handler called when the raw numeric value changes. */
  onRawValueChange?: (value: number) => void;

  /**
   * The smallest value allowed for the number field.
   * @default Number.MIN_SAFE_INTEGER
   */
  minValue?: number;

  /**
   * The largest value allowed for the number field.
   * @default Number.MAX_SAFE_INTEGER
   */
  maxValue?: number;

  /**
   * Step increment/decrement amount for Arrow keys and buttons.
   * @default 1
   */
  step?: number;

  /**
   * Page increment/decrement amount for PageUp / PageDown keys.
   * @default 10 * step
   */
  largeStep?: number;

  /**
   * Whether to increment/decrement when scrolling the mouse wheel over the focused input.
   * @default true
   */
  changeOnWheel?: boolean;

  /**
   * Whether to format the input value.
   * @default true
   */
  format?: boolean;

  /** Options passed to Intl.NumberFormat for formatting. */
  formatOptions?: Intl.NumberFormatOptions;

  /** BCP 47 language tag for formatting, defaults to "en-US". */
  locale?: string;

  /** Custom RegExp pattern restricting allowed typed characters. */
  allowedInput?: RegExp;

  /** The custom string representation of the value (for aria-valuetext). */
  textValue?: ReactiveValue<string | undefined>;
}

export interface UseNumberFieldResult {
  /** Form control coordinator instance. */
  formControl: UseFormControlResult;

  /** Current formatted text value. */
  value: ObservableValue<string>;

  /** Current raw numeric value. */
  rawValue: ObservableValue<number>;

  /** Text representation for aria-valuetext. */
  textValue: ObservableValue<string>;

  /** Sets the value (formats and updates raw value). */
  setValue: (val: string | number) => void;

  /** Varies the value by the given offset (step or largeStep). */
  varyValue: (offset: number) => void;

  /** Formats current value and synchronizes inputs. */
  format: () => void;

  /** Smallest allowed value. */
  minValue: number;

  /** Largest allowed value. */
  maxValue: number;

  /** Step amount. */
  step: number;

  /** Large step amount. */
  largeStep: number;

  /** Whether wheel scrolling changes value. */
  changeOnWheel: boolean;

  /** Formats a numeric value using configured formatOptions. */
  formatNumber: (n: number) => string;

  /** Parses an input string into a raw numeric value. */
  parseRawValue: (str: string | number | undefined) => number;

  /** Ref to the visible text input element. */
  inputRef: Ref<HTMLInputElement>;

  /** Ref to the hidden form submission input element. */
  hiddenInputRef: Ref<HTMLInputElement>;

  /** Root container ref. */
  rootRef: Ref<HTMLElement>;

  /** Semantic dataset attributes. */
  dataset: NumberFieldDataSet;

  /** Handles input typing events with validation and cursor restoration. */
  handleInput: (e: Event) => void;

  /** Handles wheel events on the focused input. */
  handleWheel: (e: WheelEvent) => void;

  /** Handles keydown events on the input. */
  handleKeyDown: (e: KeyboardEvent) => void;

  /** Handles blur on the input to commit formatting. */
  handleBlur: (e?: FocusEvent) => void;
}

export interface NumberFieldInstance extends UseNumberFieldResult {
  /** Root container element (role="group"). */
  Root: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: Record<string, any>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Main interactive text input (role="spinbutton"). */
  Input: <T extends keyof SeidrElementTagNameMap = "input">(props?: Record<string, any>) => SeidrElementTagNameMap[T];

  /** Increment stepper trigger button. */
  IncrementTrigger: <T extends keyof SeidrElementTagNameMap = "button">(
    props?: Record<string, any>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Decrement stepper trigger button. */
  DecrementTrigger: <T extends keyof SeidrElementTagNameMap = "button">(
    props?: Record<string, any>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Hidden input for native HTML form submission. */
  HiddenInput: (props?: SeidrElementProps<"input">) => HTMLInputElement;

  /** Accessible label element. */
  Label: <T extends keyof SeidrElementTagNameMap = "label">(
    props?: Record<string, any>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Accessible description element. */
  Description: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: Record<string, any>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Accessible error message element. */
  ErrorMessage: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: Record<string, any>,
    children?: SeidrChild | SeidrChild[],
  ) => DerivedValue<SeidrElementTagNameMap[T] | null>;
}

export interface NumberFieldProps<T extends keyof SeidrElementTagNameMap = "div"> extends UseNumberFieldOptions {
  /** The HTML element tag name for the root container. @default "div" */
  as?: T;

  /** Accessible label text or element. */
  label?: SeidrChild | SeidrChild[];

  /** Accessible description text or element. */
  description?: SeidrChild | SeidrChild[];

  /** Accessible error message text or element. */
  errorMessage?: SeidrChild | SeidrChild[];

  /** Placeholder text for the input. */
  placeholder?: ReactiveValue<string>;

  /** Whether to render increment and decrement stepper controls. Defaults to true. */
  controls?: boolean;

  /** Custom children to render inside root. */
  children?: SeidrChild | SeidrChild[];

  /** Props passed to NumberField.Root. */
  rootProps?: Record<string, any>;

  /** Props passed to NumberField.Input. */
  inputProps?: Record<string, any>;

  /** Props passed to NumberField.IncrementTrigger. */
  incrementProps?: Record<string, any>;

  /** Props passed to NumberField.DecrementTrigger. */
  decrementProps?: Record<string, any>;

  /** Props passed to NumberField.HiddenInput. */
  hiddenInputProps?: Record<string, any>;

  /** Props passed to NumberField.Label. */
  labelProps?: Record<string, any>;

  /** Props passed to NumberField.Description. */
  descriptionProps?: Record<string, any>;

  /** Props passed to NumberField.ErrorMessage. */
  errorMessageProps?: Record<string, any>;
}
