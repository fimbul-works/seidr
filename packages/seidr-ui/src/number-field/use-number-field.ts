import {
  createRef,
  createValue,
  isValue,
  unwrapValue,
  useId,
  type Value,
  wrapValue,
} from "@fimbul-works/seidr";
import { useFormControl } from "../form-control/use-form-control.js";
import { useControllableValue } from "../hooks/use-controllable-value.js";
import { useFormResetListener } from "../hooks/use-form-reset-listener.js";
import type { NumberFieldDataSet, UseNumberFieldOptions, UseNumberFieldResult } from "./types.js";
import { handleDecimalOperation, isValidPartialNumber, parseNumberString, snapValueToStep } from "./utils.js";

/**
 * Headless hook managing state, accessibility, decimal precision, formatting,
 * and keyboard interaction for an accessible NumberField component.
 */
export function useNumberField(options: UseNumberFieldOptions = {}): UseNumberFieldResult {
  const id = wrapValue(options.id ?? useId("number-field"));
  const name = wrapValue(options.name ?? id());

  const formControl = useFormControl({
    id,
    name,
    validationState: options.validationState,
    required: options.required,
    disabled: options.disabled,
    readOnly: options.readOnly,
  });

  const minValue = options.minValue ?? Number.MIN_SAFE_INTEGER;
  const maxValue = options.maxValue ?? Number.MAX_SAFE_INTEGER;
  const step = options.step ?? 1;
  const largeStep = options.largeStep ?? step * 10;
  const changeOnWheel = options.changeOnWheel ?? true;
  const shouldFormat = options.format ?? true;
  const locale = options.locale ?? "en-US";

  const formatter = new Intl.NumberFormat(locale, options.formatOptions);

  const formatNumber = (n: number): string => {
    if (!shouldFormat) return String(n);
    if (Number.isNaN(n)) return "";
    return formatter.format(n);
  };

  const parseRawValue = (str: string | number | undefined): number => {
    return parseNumberString(str);
  };

  const initialRaw =
    options.rawValue !== undefined
      ? unwrapValue(options.rawValue)
      : options.defaultValue !== undefined
        ? parseRawValue(options.defaultValue)
        : options.value !== undefined
          ? parseRawValue(unwrapValue(options.value))
          : Number.NaN;

  const rawValueState: Value<number> = createValue(initialRaw ?? Number.NaN);

  const formatInitial = (val: string | number | undefined): string => {
    if (val == null) return "";
    const parsed = parseRawValue(val);
    if (Number.isNaN(parsed)) return String(val);
    return formatNumber(parsed);
  };

  const initialFormatted =
    options.value !== undefined
      ? formatInitial(unwrapValue(options.value))
      : options.defaultValue !== undefined
        ? formatInitial(options.defaultValue)
        : options.rawValue !== undefined &&
            unwrapValue(options.rawValue) != null &&
            !Number.isNaN(unwrapValue(options.rawValue))
          ? formatNumber(unwrapValue(options.rawValue)!)
          : "";

  const internalFormatted = useControllableValue<string>({
    value: isValue(options.value)
      ? options.value.as((v) => (v != null ? String(v) : ""))
      : typeof options.value === "number" || typeof options.value === "string"
        ? String(options.value)
        : undefined,
    defaultValue: initialFormatted,
    onChange: (val) => {
      options.onChange?.(val);
      const raw = parseRawValue(val);
      if (!Number.isNaN(raw)) {
        rawValueState(raw);
        options.onRawValueChange?.(raw);
      }
    },
  });

  // Keep rawValue synchronized if controlled options.rawValue changes externally
  if (isValue(options.rawValue)) {
    options.rawValue.watch((newRaw) => {
      if (newRaw != null && !Number.isNaN(newRaw)) {
        rawValueState(newRaw);
        const formatted = formatNumber(newRaw);
        if (internalFormatted() !== formatted) {
          internalFormatted(formatted);
        }
      }
    });
  }

  const inputRef = createRef<HTMLInputElement>();
  const hiddenInputRef = createRef<HTMLInputElement>();
  const rootRef = createRef<HTMLElement>();

  const isBlocked = () => formControl.isReadOnly() || formControl.isDisabled();

  const syncDomInputs = (formatted: string, raw: number) => {
    const input = inputRef();
    if (input && input.value !== formatted) {
      input.value = formatted;
    }
    const hidden = hiddenInputRef();
    if (hidden) {
      hidden.value = Number.isNaN(raw) ? "" : String(raw);
    }
  };

  const setValue = (val: string | number) => {
    if (isBlocked()) return;

    const parsed = parseRawValue(val);
    let raw = parsed;
    if (!Number.isNaN(raw)) {
      if (raw < minValue) raw = minValue;
      if (raw > maxValue) raw = maxValue;
      rawValueState(raw);
      options.onRawValueChange?.(raw);
      const formatted = formatNumber(raw);
      internalFormatted(formatted);
      syncDomInputs(formatted, raw);
    } else {
      rawValueState(Number.NaN);
      internalFormatted(String(val));
      syncDomInputs(String(val), Number.NaN);
    }
  };

  const format = () => {
    let raw = rawValueState();
    if (Number.isNaN(raw)) {
      raw = parseRawValue(internalFormatted());
    }

    if (Number.isNaN(raw)) {
      syncDomInputs("", Number.NaN);
      return;
    }

    if (raw < minValue) raw = minValue;
    if (raw > maxValue) raw = maxValue;

    rawValueState(raw);
    options.onRawValueChange?.(raw);

    const formatted = formatNumber(raw);
    if (internalFormatted() !== formatted) {
      internalFormatted(formatted);
    }
    syncDomInputs(formatted, raw);
  };

  const varyValue = (offset: number) => {
    if (isBlocked()) return;

    let current = rawValueState();
    if (Number.isNaN(current)) {
      current = parseRawValue(internalFormatted());
      if (Number.isNaN(current)) {
        current = 0;
      }
    }

    const op = offset > 0 ? "+" : "-";
    const absOffset = Math.abs(offset);

    let next = snapValueToStep(current, minValue, maxValue, absOffset);

    // If snapping alone didn't change the value in the intended direction, add offset and snap
    if ((op === "+" && next <= current) || (op === "-" && next >= current)) {
      const added = handleDecimalOperation(op, current, absOffset);
      next = snapValueToStep(added, minValue, maxValue, absOffset);
    }

    if (next < minValue) next = minValue;
    if (next > maxValue) next = maxValue;

    rawValueState(next);
    options.onRawValueChange?.(next);

    const formatted = formatNumber(next);
    internalFormatted(formatted);
    syncDomInputs(formatted, next);
  };

  // Restore initial state on parent form reset
  useFormResetListener(rootRef, () => {
    const defaultVal = options.defaultValue ?? "";
    setValue(defaultVal);
    format();
  });

  const handleInput = (e: Event) => {
    if (isBlocked()) return;

    const target = e.target as HTMLInputElement;
    const typed = target.value;

    if (options.allowedInput && typed && !options.allowedInput.test(typed)) {
      target.value = internalFormatted();
      return;
    }

    if (!isValidPartialNumber(typed)) {
      target.value = internalFormatted();
      return;
    }

    internalFormatted(typed);
    const parsed = parseRawValue(typed);
    if (!Number.isNaN(parsed)) {
      rawValueState(parsed);
      options.onRawValueChange?.(parsed);
      const hidden = hiddenInputRef();
      if (hidden) {
        hidden.value = String(parsed);
      }
    }
  };

  const handleBlur = () => {
    format();
  };

  const handleWheel = (e: WheelEvent) => {
    if (!changeOnWheel || isBlocked()) return;
    if (document.activeElement !== inputRef()) return;

    e.preventDefault();
    if (e.deltaY < 0) {
      varyValue(step);
    } else if (e.deltaY > 0) {
      varyValue(-step);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.defaultPrevented || isBlocked()) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    switch (e.key) {
      case "PageUp":
        e.preventDefault();
        varyValue(largeStep);
        break;
      case "ArrowUp":
      case "Up":
        e.preventDefault();
        varyValue(step);
        break;
      case "PageDown":
        e.preventDefault();
        varyValue(-largeStep);
        break;
      case "ArrowDown":
      case "Down":
        e.preventDefault();
        varyValue(-step);
        break;
      case "Home":
        if (Number.isFinite(minValue)) {
          e.preventDefault();
          setValue(minValue);
        }
        break;
      case "End":
        if (Number.isFinite(maxValue)) {
          e.preventDefault();
          setValue(maxValue);
        }
        break;
    }
  };

  const textValue =
    options.textValue !== undefined
      ? wrapValue(options.textValue).as((t) => t ?? internalFormatted())
      : internalFormatted.as((v) => v.replace("-", "\u2212"));

  const dataset: NumberFieldDataSet = {
    ...formControl.dataset,
  };

  return {
    formControl,
    value: internalFormatted.as((v) => v),
    rawValue: rawValueState.as((r) => r),
    textValue,
    setValue,
    varyValue,
    format,
    minValue,
    maxValue,
    step,
    largeStep,
    changeOnWheel,
    formatNumber,
    parseRawValue,
    inputRef,
    hiddenInputRef,
    rootRef,
    dataset,
    handleInput,
    handleWheel,
    handleKeyDown,
    handleBlur,
  };
}
