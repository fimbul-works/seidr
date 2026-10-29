import { mergeValues, useId, wrapValue } from "@fimbul-works/seidr";
import type { UseProgressOptions, UseProgressResult } from "./types.js";

/**
 * Headless state and logic coordinator for Progress bars.
 */
export function useProgress(options: UseProgressOptions = {}): UseProgressResult {
  const {
    id: customId,
    value: rawValueProp,
    minValue = 0,
    maxValue = 100,
    indeterminate: rawIndeterminateProp,
    getValueLabel,
    role = "progressbar",
    dataComponent = "progress",
  } = options;

  const id = customId ?? useId(dataComponent);
  const rawValue = wrapValue(rawValueProp ?? 0);
  const isIndeterminate = wrapValue(rawIndeterminateProp ?? false).as((v) => Boolean(v));

  const range = Math.max(maxValue - minValue, 0.0001);

  // Clamped value derived from rawValue within [minValue, maxValue]
  const clampedValue = rawValue.as((v) => Math.min(Math.max(v, minValue), maxValue));

  // Percentage [0, 1]
  const valuePercent = clampedValue.as((v) => (v - minValue) / range);

  // Formatted value label: undefined when indeterminate
  const valueLabel = mergeValues(
    () => {
      if (isIndeterminate()) {
        return undefined;
      }
      const val = clampedValue();
      if (getValueLabel) {
        return getValueLabel({ value: val, min: minValue, max: maxValue });
      }
      return `${Math.round(valuePercent() * 100)}%`;
    },
    { parents: [clampedValue, valuePercent, isIndeterminate] },
  );

  // Progress state: "loading" | "complete" | undefined
  const progressState = mergeValues(
    () => {
      if (isIndeterminate()) {
        return undefined;
      }
      return valuePercent() >= 1 ? "complete" : "loading";
    },
    { parents: [valuePercent, isIndeterminate] },
  );

  // CSS fill width string
  const fillWidth = mergeValues(
    () => {
      if (isIndeterminate()) {
        return undefined;
      }
      return `${valuePercent() * 100}%`;
    },
    { parents: [valuePercent, isIndeterminate] },
  );

  return {
    id,
    role,
    dataComponent,
    value: clampedValue,
    valuePercent,
    valueLabel,
    isIndeterminate,
    progressState,
    minValue,
    maxValue,
    fillWidth,
  };
}
