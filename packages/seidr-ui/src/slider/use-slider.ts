import { isFn } from "@fimbul-works/hvat";
import {
  createValue,
  type DerivedValue,
  inClient,
  type ObservableValue,
  useId,
  type Value,
  wrapValue,
} from "@fimbul-works/seidr";
import { useControllableValue } from "../hooks/use-controllable-value.js";
import type { SliderDataSet, UseSliderOptions, UseSliderResult } from "./types.js";
import { clamp, getClosestValueIndex, snapValueToStep } from "./utils.js";

/**
 * Headless state coordinator for an accessible WAI-ARIA Slider collection.
 */
export function useSlider(options: UseSliderOptions = {}): UseSliderResult {
  const {
    id: customId,
    minValue = 0,
    maxValue = 100,
    step = 1,
    minStepsBetweenThumbs = 0,
    orientation = "horizontal",
    inverted = false,
    name,
  } = options;

  const id = customId ?? useId("slider");

  const disabledObservable = wrapValue(options.disabled ?? false);
  const isDisabled: DerivedValue<boolean> = disabledObservable.as((d) => !!d);

  const readOnlyObservable = wrapValue(options.readOnly ?? false);
  const isReadOnly: DerivedValue<boolean> = readOnlyObservable.as((r) => !!r);

  const normalizeValues = (v: number[] | number | undefined): number[] => {
    if (v === undefined) return [minValue];
    return Array.isArray(v) ? v : [v];
  };

  let controlledValues: ObservableValue<number[]> | undefined;
  if (options.value !== undefined) {
    const wrapped = wrapValue(options.value);
    controlledValues = wrapped.as((v) => normalizeValues(v));
  }

  const internalState = useControllableValue<number[]>({
    value: controlledValues,
    defaultValue: normalizeValues(options.defaultValue),
    onChange: options.onChange,
  });

  const focusedThumb: Value<number | undefined> = createValue<number | undefined>(undefined);
  const isDragging: Value<boolean> = createValue(false);
  const trackElement: Value<HTMLElement | null> = createValue<HTMLElement | null>(null);

  const pageSize = Math.max(snapValueToStep((maxValue - minValue) / 10, 0, maxValue - minValue, step), step);

  const getValuePercent = (val: number): number => {
    if (maxValue === minValue) return 0;
    return clamp((val - minValue) / (maxValue - minValue), 0, 1);
  };

  const getThumbPercent = (index: number): DerivedValue<number> => {
    return internalState.as((vals) => {
      const val = vals[index] ?? minValue;
      const pct = getValuePercent(val);
      return inverted ? 1 - pct : pct;
    });
  };

  const getThumbValue = (index: number): number => {
    return internalState()[index] ?? minValue;
  };

  const setThumbValue = (index: number, rawVal: number) => {
    if (isDisabled() || isReadOnly()) return;

    const snapped = snapValueToStep(rawVal, minValue, maxValue, step);
    const current = [...internalState()];
    if (index < 0 || index >= current.length) return;

    const minAllowed = index === 0 ? minValue : (current[index - 1] ?? minValue) + minStepsBetweenThumbs * step;
    const maxAllowed =
      index === current.length - 1 ? maxValue : (current[index + 1] ?? maxValue) - minStepsBetweenThumbs * step;

    const clamped = clamp(snapped, minAllowed, maxAllowed);
    if (current[index] === clamped) return;

    current[index] = clamped;
    internalState(current);
  };

  const getValueFromPointer = (pointerCoord: { x: number; y: number }): number => {
    const track = trackElement();
    if (!track) return minValue;

    const rect = track.getBoundingClientRect();
    const isVertical = orientation === "vertical";
    const size = isVertical ? rect.height : rect.width;
    if (size <= 0) return minValue;

    let percent: number;
    if (isVertical) {
      // For vertical, bottom is 0% (minValue) unless inverted
      percent = (rect.bottom - pointerCoord.y) / size;
    } else {
      // For horizontal, left is 0% (minValue) unless inverted
      percent = (pointerCoord.x - rect.left) / size;
    }

    if (inverted) {
      percent = 1 - percent;
    }

    percent = clamp(percent, 0, 1);
    const rawVal = minValue + percent * (maxValue - minValue);
    return snapValueToStep(rawVal, minValue, maxValue, step);
  };

  const startDrag = (e: PointerEvent, initialThumbIndex?: number) => {
    if (isDisabled() || isReadOnly()) return;
    if (e.button !== 0) return; // Only primary mouse button

    inClient(() => {
      const target = e.currentTarget as HTMLElement;
      if (isFn(target.setPointerCapture)) {
        target.setPointerCapture(e.pointerId);
      }

      const calculatedVal = getValueFromPointer({ x: e.clientX, y: e.clientY });
      const current = internalState();

      const activeIndex =
        initialThumbIndex !== undefined ? initialThumbIndex : getClosestValueIndex(current, calculatedVal);

      focusedThumb(activeIndex);
      isDragging(true);
      setThumbValue(activeIndex, calculatedVal);

      const onPointerMove = (moveEvent: PointerEvent) => {
        if (moveEvent.pointerId !== e.pointerId) return;
        const nextVal = getValueFromPointer({ x: moveEvent.clientX, y: moveEvent.clientY });
        setThumbValue(activeIndex, nextVal);
      };

      const onPointerUp = (upEvent: PointerEvent) => {
        if (upEvent.pointerId !== e.pointerId) return;

        if (isFn(target.releasePointerCapture)) {
          try {
            target.releasePointerCapture(upEvent.pointerId);
          } catch {
            // Element might already be uncaptured
          }
        }

        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
        window.removeEventListener("pointercancel", onPointerUp);

        isDragging(false);
        options.onChangeEnd?.(internalState());
      };

      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
      window.addEventListener("pointercancel", onPointerUp);
    });
  };

  const handleTrackPointerDown = (e: PointerEvent) => {
    startDrag(e);
  };

  const handleThumbPointerDown = (index: number, e: PointerEvent) => {
    startDrag(e, index);
  };

  const handleThumbKeyDown = (index: number, e: KeyboardEvent) => {
    if (isDisabled() || isReadOnly()) return;

    const current = internalState()[index] ?? minValue;
    let nextVal = current;

    const isHorizontal = orientation === "horizontal";
    const incKey = isHorizontal ? "ArrowRight" : "ArrowUp";
    const decKey = isHorizontal ? "ArrowLeft" : "ArrowDown";

    if (e.key === incKey) {
      e.preventDefault();
      nextVal = inverted ? current - step : current + step;
    } else if (e.key === decKey) {
      e.preventDefault();
      nextVal = inverted ? current + step : current - step;
    } else if (e.key === "PageUp") {
      e.preventDefault();
      nextVal = inverted ? current - pageSize : current + pageSize;
    } else if (e.key === "PageDown") {
      e.preventDefault();
      nextVal = inverted ? current + pageSize : current - pageSize;
    } else if (e.key === "Home") {
      e.preventDefault();
      nextVal = inverted ? maxValue : minValue;
    } else if (e.key === "End") {
      e.preventDefault();
      nextVal = inverted ? minValue : maxValue;
    } else {
      return;
    }

    setThumbValue(index, nextVal);
    options.onChangeEnd?.(internalState());
  };

  const getValueLabel = internalState.as((vals) => {
    if (options.getValueLabel) {
      return options.getValueLabel({ values: vals, min: minValue, max: maxValue });
    }
    return vals.join(", ");
  });

  const registerTrack = (el: HTMLElement | null) => {
    trackElement(el);
  };

  const generateThumbId = (index: number) => `${id}-thumb-${index}`;
  const generateInputId = (index: number) => `${id}-input-${index}`;

  const dataset: SliderDataSet = {
    "data-orientation": orientation,
    ...(isDisabled() ? { "data-disabled": "" } : {}),
    ...(isReadOnly() ? { "data-readonly": "" } : {}),
  };

  return {
    id,
    values: internalState.as((v) => v),
    getThumbValue,
    setThumbValue,
    getThumbPercent,
    getValuePercent,
    getValueLabel,
    focusedThumb,
    isDragging,
    minValue,
    maxValue,
    step,
    pageSize,
    orientation,
    inverted,
    isDisabled,
    isReadOnly,
    registerTrack,
    trackElement,
    handleTrackPointerDown,
    handleThumbPointerDown,
    handleThumbKeyDown,
    generateThumbId,
    generateInputId,
    name,
    dataset,
  };
}
