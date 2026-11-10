import { isNullish, isUndef } from "@fimbul-works/hvat";
import {
  $,
  type ReactiveValue,
  resolvePropsAndChildren,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  unwrapValue,
  wrapValue,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_SPIN_BUTTON } from "./constants.js";
import type { ValidationState } from "./form-control/types.js";
import { useControllableValue } from "./hooks/use-controllable-value.js";

export interface SpinButtonOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  /**
   * The HTML element tag name to render.
   * @default "div"
   */
  as?: T;

  /** The controlled value of the spin button. */
  value?: ReactiveValue<number>;

  /** The default value when initially rendered (uncontrolled). */
  defaultValue?: number;

  /** Event handler called when the value changes. */
  onChange?: (value: number) => void;

  /** The formatted string representation of the value. */
  valueText?: ReactiveValue<string>;

  /** The smallest value allowed for the spin button. */
  minValue?: ReactiveValue<number>;

  /** The largest value allowed for the spin button. */
  maxValue?: ReactiveValue<number>;

  /** Increment/Decrement step (Arrow Up/Down). Defaults to 1. */
  step?: number;

  /** Page Increment/Decrement step (Page Up/Down). Defaults to 10 * step. */
  largeStep?: number;

  /** Whether the value rolls around between min and max when reaching bounds. Defaults to false. */
  loop?: boolean;

  /**
   * The tab index of the spin button.
   * @default 0
   */
  tabIndex?: ReactiveValue<number>;

  /** Whether the spin button should display its "valid" or "invalid" visual styling. */
  validationState?: ReactiveValue<ValidationState | undefined>;

  /** Whether the user must fill the spin button before submitting. */
  required?: ReactiveValue<boolean>;

  /** Whether the spin button is disabled. */
  disabled?: ReactiveValue<boolean>;

  /** Whether the spin button is read only. */
  readOnly?: ReactiveValue<boolean>;

  /** Custom increment handler (called on ArrowUp). */
  onIncrement?: () => void;

  /** Custom decrement handler (called on ArrowDown). */
  onDecrement?: () => void;

  /** Custom page increment handler (called on PageUp). */
  onIncrementPage?: () => void;

  /** Custom page decrement handler (called on PageDown). */
  onDecrementPage?: () => void;

  /** Custom handler to jump to min (called on Home). */
  onDecrementToMin?: () => void;

  /** Custom handler to jump to max (called on End). */
  onIncrementToMax?: () => void;
}

export type SpinButtonProps<T extends keyof SeidrElementTagNameMap = "div"> = SpinButtonOptions<T> &
  Omit<SeidrElementProps<T>, "onChange" | "disabled" | "required" | "readOnly">;

/**
 * SpinButton is an accessible numeric stepper atom implementing WAI-ARIA spinbutton
 * keyboard navigation (ArrowUp, ArrowDown, PageUp, PageDown, Home, End).
 */
export function SpinButton<T extends keyof SeidrElementTagNameMap = "div">(
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function SpinButton<T extends keyof SeidrElementTagNameMap = "div">(
  props: SpinButtonProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function SpinButton<T extends keyof SeidrElementTagNameMap = "div">(
  propsOrChildren?: SpinButtonProps<T> | SeidrChild | SeidrChild[],
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const [props, content] = resolvePropsAndChildren<SpinButtonProps<T>>(propsOrChildren, children);

  const {
    as = "div" as T,
    value: controlledValue,
    defaultValue,
    onChange,
    valueText,
    minValue,
    maxValue,
    step = 1,
    largeStep,
    loop = false,
    validationState,
    required = false,
    disabled = false,
    readOnly = false,
    onIncrement,
    onDecrement,
    onIncrementPage,
    onDecrementPage,
    onDecrementToMin,
    onIncrementToMax,
    tabIndex = 0,
    onkeydown,
    ...rest
  } = props;

  const state = useControllableValue<number>({
    value: controlledValue,
    defaultValue: defaultValue ?? 0,
    onChange,
  });

  const isRequired = wrapValue(required ?? false);
  const isDisabled = wrapValue(disabled ?? false);
  const isReadOnly = wrapValue(readOnly ?? false);
  const isInvalid = wrapValue(validationState).as((s) => s === "invalid");

  const effectiveLargeStep = largeStep ?? step * 10;

  const handleStep = (delta: number) => {
    if (isDisabled() || isReadOnly()) return;
    const current = state() ?? 0;
    const min = unwrapValue(minValue);
    const max = unwrapValue(maxValue);

    let next = current + delta;

    if (!isNullish(max) && next > max) {
      next = loop && !isNullish(min) ? min : max;
    } else if (!isNullish(min) && next < min) {
      next = loop && !isNullish(max) ? max : min;
    }

    state(next);
  };

  const handleJumpToMin = () => {
    if (isDisabled() || isReadOnly()) return;
    const min = unwrapValue(minValue);
    if (!isUndef(min)) {
      state(min);
    }
  };

  const handleJumpToMax = () => {
    if (isDisabled() || isReadOnly()) return;
    const max = unwrapValue(maxValue);
    if (!isUndef(max)) {
      state(max);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    (onkeydown as any)?.(e);
    if (e.defaultPrevented) return;
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || isReadOnly() || isDisabled()) {
      return;
    }

    switch (e.key) {
      case "PageUp":
        e.preventDefault();
        if (onIncrementPage) {
          onIncrementPage();
        } else if (onIncrement) {
          onIncrement();
        } else {
          handleStep(effectiveLargeStep);
        }
        break;
      case "ArrowUp":
      case "Up":
        e.preventDefault();
        if (onIncrement) {
          onIncrement();
        } else {
          handleStep(step);
        }
        break;
      case "PageDown":
        e.preventDefault();
        if (onDecrementPage) {
          onDecrementPage();
        } else if (onDecrement) {
          onDecrement();
        } else {
          handleStep(-effectiveLargeStep);
        }
        break;
      case "ArrowDown":
      case "Down":
        e.preventDefault();
        if (onDecrement) {
          onDecrement();
        } else {
          handleStep(-step);
        }
        break;
      case "Home":
        e.preventDefault();
        if (onDecrementToMin) {
          onDecrementToMin();
        } else {
          handleJumpToMin();
        }
        break;
      case "End":
        e.preventDefault();
        if (onIncrementToMax) {
          onIncrementToMax();
        } else {
          handleJumpToMax();
        }
        break;
    }
  };

  // Replace Unicode hyphen-minus (U+002D) with minus sign (U+2212)
  const defaultTextValue = state.as((v) => (!isNullish(v) ? String(v).replace("-", "\u2212") : "Empty"));
  const effectiveTextValue = !isNullish(valueText) ? wrapValue(valueText) : defaultTextValue;
  const effectiveChildren = content ?? effectiveTextValue;
  const effectiveTabIndex = isDisabled.as((d) => (d ? -1 : (unwrapValue(tabIndex) ?? 0)));

  return $(
    as,
    {
      role: "spinbutton",
      tabIndex: effectiveTabIndex,
      dataComponent: DATA_COMPONENT_SPIN_BUTTON,
      "aria-valuenow": state.as((v) => (!isNullish(v) && !Number.isNaN(v) ? v : undefined)),
      "aria-valuetext": effectiveTextValue,
      "aria-valuemin": !isUndef(minValue)
        ? wrapValue(minValue).as((v) => (!isNullish(v) && !Number.isNaN(v) ? v : undefined))
        : undefined,
      "aria-valuemax": !isUndef(maxValue)
        ? wrapValue(maxValue).as((v) => (!isNullish(v) && !Number.isNaN(v) ? v : undefined))
        : undefined,
      "aria-required": isRequired.as((r) => (r ? "true" : undefined)),
      "aria-disabled": isDisabled.as((d) => (d ? "true" : undefined)),
      "aria-readonly": isReadOnly.as((r) => (r ? "true" : undefined)),
      "aria-invalid": isInvalid.as((i) => (i ? "true" : undefined)),
      "data-disabled": isDisabled.as((d) => (d ? "" : undefined)),
      "data-readonly": isReadOnly.as((r) => (r ? "" : undefined)),
      "data-invalid": isInvalid.as((i) => (i ? "" : undefined)),
      onkeydown: handleKeyDown,
      ...rest,
    } as SeidrElementProps<T>,
    effectiveChildren,
  );
}
