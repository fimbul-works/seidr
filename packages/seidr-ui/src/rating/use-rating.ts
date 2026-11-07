import {
  createRef,
  createValue,
  type DerivedValue,
  mergeValues,
  type Ref,
  useId,
  type Value,
  wrapValue,
} from "@fimbul-works/seidr";
import { useFormControl } from "../form-control/use-form-control.js";
import { useFormResetListener } from "../hooks/use-form-reset-listener.js";
import type {
  RatingItemState,
  UseRatingOptions,
  UseRatingResult,
} from "./types.js";

/**
 * Headless coordinator hook managing rating score, hover preview, half-star calculations,
 * roving tabindex focus, and form submission synchronization.
 */
export function useRating(options: UseRatingOptions = {}): UseRatingResult {
  const autoId = useId("rating");
  const id = options.id ?? autoId;
  const dataComponent = options.dataComponent ?? "rating";
  const max = options.max ?? 5;
  const allowHalf = options.allowHalf ?? false;
  const allowClear = options.allowClear ?? true;
  const orientation = options.orientation ?? "horizontal";

  const formControl = useFormControl({
    id,
    name: options.name,
    disabled: options.disabled,
    readOnly: options.readOnly,
    required: options.required,
    validationState: options.validationState,
  });

  const defaultValue = options.defaultValue ?? 0;
  const valueState: Value<number> = options.value
    ? (wrapValue(options.value) as Value<number>)
    : createValue<number>(defaultValue);

  const hoveredValue = createValue<number | null>(null);

  const displayValue: DerivedValue<number> = mergeValues(
    () => hoveredValue() ?? valueState(),
    { parents: [hoveredValue, valueState] },
  );

  const rootRef = createRef<HTMLElement>();

  const isDisabled: DerivedValue<boolean> = formControl.isDisabled.as((d) => Boolean(d));
  const isReadOnly: DerivedValue<boolean> = formControl.isReadOnly.as((r) => Boolean(r));

  if (options.onChange) {
    valueState.watch((v) => {
      options.onChange?.(v);
    });
  }

  const clamp = (val: number): number => {
    return Math.max(0, Math.min(max, val));
  };

  const setValue = (val: number) => {
    if (isDisabled() || isReadOnly()) return;
    const clamped = clamp(val);
    valueState(clamped);
  };

  const setHoveredValue = (val: number | null) => {
    if (isDisabled() || isReadOnly()) return;
    if (val === null) {
      hoveredValue(null);
    } else {
      hoveredValue(clamp(val));
    }
  };

  const commitItemValue = (itemVal: number) => {
    if (isDisabled() || isReadOnly()) return;
    const current = hoveredValue() ?? itemVal;

    if (allowClear && valueState() === current) {
      setValue(0);
      setHoveredValue(null);
    } else {
      setValue(current);
      setHoveredValue(null);
    }
  };

  const handleItemPointerMove = (e: PointerEvent, itemVal: number, target: HTMLElement) => {
    if (isDisabled() || isReadOnly()) return;

    if (allowHalf && target) {
      const rect = target.getBoundingClientRect();
      const isHorizontal = orientation === "horizontal";

      if (isHorizontal) {
        const isLeftHalf = e.clientX - rect.left < rect.width / 2;
        if (isLeftHalf) {
          setHoveredValue(Math.max(0.5, itemVal - 0.5));
          return;
        }
      } else {
        const isTopHalf = e.clientY - rect.top < rect.height / 2;
        if (isTopHalf) {
          setHoveredValue(Math.max(0.5, itemVal - 0.5));
          return;
        }
      }
    }

    setHoveredValue(itemVal);
  };

  const handleItemPointerEnter = (e: PointerEvent, itemVal: number, target: HTMLElement) => {
    handleItemPointerMove(e, itemVal, target);
  };

  const step = allowHalf ? 0.5 : 1;

  const increment = (customStep?: number) => {
    setValue(valueState() + (customStep ?? step));
  };

  const decrement = (customStep?: number) => {
    setValue(valueState() - (customStep ?? step));
  };

  const handleRootKeyDown = (e: KeyboardEvent) => {
    if (isDisabled() || isReadOnly()) return;

    const isHorizontal = orientation === "horizontal";
    const nextKey = isHorizontal ? "ArrowRight" : "ArrowDown";
    const prevKey = isHorizontal ? "ArrowLeft" : "ArrowUp";

    switch (e.key) {
      case nextKey:
      case "ArrowUp":
        e.preventDefault();
        e.stopPropagation();
        increment();
        break;
      case prevKey:
      case "ArrowDown":
        e.preventDefault();
        e.stopPropagation();
        decrement();
        break;
      case "Home":
        e.preventDefault();
        e.stopPropagation();
        setValue(0);
        break;
      case "End":
        e.preventDefault();
        e.stopPropagation();
        setValue(max);
        break;
    }
  };

  const getItemState = (itemVal: number): DerivedValue<RatingItemState> => {
    return displayValue.as((dv) => {
      if (dv >= itemVal) return "checked";
      if (allowHalf && dv >= itemVal - 0.5) return "half";
      return "unchecked";
    });
  };

  // Listen to parent <form> reset events
  useFormResetListener(rootRef, () => {
    valueState(defaultValue);
    hoveredValue(null);
  });

  return {
    id,
    dataComponent,
    value: valueState,
    hoveredValue,
    displayValue,
    max,
    allowHalf,
    allowClear,
    orientation,
    isDisabled,
    isReadOnly,
    formControl,
    rootRef,
    setValue,
    setHoveredValue,
    commitItemValue,
    handleItemPointerMove,
    handleItemPointerEnter,
    handleRootKeyDown,
    getItemState,
  };
}

