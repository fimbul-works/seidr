import {
  $,
  type ReactiveValue,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { UseNumberFieldResult } from "./types.js";

export interface NumberFieldInputOptions<T extends keyof SeidrElementTagNameMap = "input"> {
  /**
   * The HTML element tag name to render.
   * @default "input"
   */
  as?: T;

  /**
   * Explicit number field coordinator instance providing reactive state.
   */
  instance?: UseNumberFieldResult;

  /** Virtual keyboard inputMode hint. Defaults to "decimal". */
  inputMode?: ReactiveValue<string>;

  type?: string;
  autocomplete?: string;
  autocorrect?: string;
  spellcheck?: boolean;
  tabIndex?: number;
  placeholder?: ReactiveValue<string>;
  dataComponent?: string;
  dataPart?: string;
  oninput?: (e: Event) => void;
  onkeydown?: (e: KeyboardEvent) => void;
  onwheel?: (e: WheelEvent) => void;
  onblur?: (e: FocusEvent) => void;
}

export type NumberFieldInputProps<T extends keyof SeidrElementTagNameMap = "input"> = NumberFieldInputOptions<T> &
  SeidrElementProps<T>;

/**
 * NumberFieldInput is the interactive text input with WAI-ARIA spinbutton attributes.
 */
export function NumberFieldInput<T extends keyof SeidrElementTagNameMap = "input">(
  props: NumberFieldInputProps<T> = {} as NumberFieldInputProps<T>,
): SeidrElementTagNameMap[T] {
  const {
    as = "input" as T,
    instance: nf,
    id,
    type = "text",
    inputMode = "decimal",
    autocomplete = "off",
    autocorrect = "off",
    spellcheck = false,
    oninput,
    onkeydown,
    onwheel,
    onblur,
    ...rest
  } = props;

  if (!nf) {
    throw new SeidrError("NumberFieldInput requires an instance coordinator");
  }

  const handleInput = (e: Event) => {
    (oninput as (ev: Event) => void)?.(e);
    if (e.defaultPrevented) return;
    nf.handleInput(e);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    (onkeydown as (ev: KeyboardEvent) => void)?.(e);
    if (e.defaultPrevented) return;
    nf.handleKeyDown(e);
  };

  const handleWheel = (e: WheelEvent) => {
    (onwheel as (ev: WheelEvent) => void)?.(e);
    if (e.defaultPrevented) return;
    nf.handleWheel(e);
  };

  const handleBlur = (e: FocusEvent) => {
    (onblur as (ev: FocusEvent) => void)?.(e);
    if (e.defaultPrevented) return;
    nf.handleBlur(e);
  };

  return $(as, {
    type,
    inputMode,
    autocomplete,
    autocorrect,
    spellcheck,
    role: "spinbutton",
    id: id ?? nf.formControl.fieldId,
    ref: nf.inputRef,
    value: nf.value,
    "aria-valuenow": nf.rawValue.as((r) => (!Number.isNaN(r) ? String(r) : undefined)),
    "aria-valuemin": Number.isFinite(nf.minValue) ? String(nf.minValue) : undefined,
    "aria-valuemax": Number.isFinite(nf.maxValue) ? String(nf.maxValue) : undefined,
    "aria-valuetext": nf.textValue,
    "aria-required": nf.formControl.isRequired.as((r) => (r ? "true" : undefined)),
    "aria-disabled": nf.formControl.isDisabled.as((d) => (d ? "true" : undefined)),
    "aria-readonly": nf.formControl.isReadOnly.as((r) => (r ? "true" : undefined)),
    "aria-invalid": nf.formControl.isInvalid.as((i) => (i ? "true" : undefined)),
    "aria-labelledby": nf.formControl.ariaLabelledBy,
    "aria-describedby": nf.formControl.ariaDescribedBy,
    disabled: nf.formControl.isDisabled,
    readOnly: nf.formControl.isReadOnly,
    required: nf.formControl.isRequired,
    ...nf.dataset,
    dataComponent: "number-field",
    dataPart: "input",
    oninput: handleInput,
    onkeydown: handleKeyDown,
    onwheel: handleWheel,
    onblur: handleBlur,
    ...rest,
  } as SeidrElementProps<T>);
}
