import {
  createRef,
  createValue,
  isValue,
  mergeValues,
  unwrapValue,
  wrapValue,
} from "@fimbul-works/seidr";
import { useFormControl } from "../form-control/use-form-control.js";
import { useFormResetListener } from "../hooks/use-form-reset-listener.js";
import type { ValidationState } from "../form-control/types.js";
import type {
  SegmentType,
  Time,
  TimeFieldGranularity,
  TimeFieldHourCycle,
  TimeFieldIntlTranslations,
  UseTimeFieldOptions,
  UseTimeFieldResult,
} from "./types.js";
import {
  DEFAULT_TIME_FIELD_INTL,
  formatTime,
  isTimeInRange,
} from "./util.js";

/**
 * Headless state and interaction coordinator for TimeField.
 */
export function useTimeField(
  options: UseTimeFieldOptions = {},
): UseTimeFieldResult {
  const {
    value: userValue,
    defaultValue,
    onChange,
    hourCycle: userHourCycle = 12,
    granularity: userGranularity = "minute",
    forceLeadingZeros: userForceLeadingZeros = false,
    placeholder,
    min,
    max,
    translations: userTranslations,
    validationState: userValidationState,
    ...formControlOptions
  } = options;

  const translations: TimeFieldIntlTranslations = {
    ...DEFAULT_TIME_FIELD_INTL,
    ...userTranslations,
  };

  const hourCycle = wrapValue(userHourCycle as TimeFieldHourCycle | undefined).as(
    (hc) => (hc === 24 ? 24 : 12),
  );
  const granularity = wrapValue(
    userGranularity as TimeFieldGranularity | undefined,
  ).as((g) => g ?? "minute");
  const forceLeadingZeros = wrapValue(
    userForceLeadingZeros as boolean | undefined,
  ).as((flz) => !!flz);

  const initial = unwrapValue(userValue) ?? defaultValue;
  const internalValue = createValue<Time | undefined>(initial);

  if (isValue<Time | undefined>(userValue)) {
    userValue.watch((v) => {
      internalValue(v);
    });
  }

  const computedValidationState = mergeValues<ValidationState | undefined>(
    () => {
      const cur = internalValue();
      if (!isTimeInRange(cur, min, max)) {
        return "invalid";
      }
      return unwrapValue(userValidationState);
    },
    {
      parents: isValue(userValidationState)
        ? [internalValue, userValidationState]
        : [internalValue],
    },
  );

  const formControl = useFormControl({
    ...formControlOptions,
    validationState: computedValidationState,
  });

  const inputRef = createRef<HTMLElement>();

  useFormResetListener(inputRef, () => {
    internalValue(defaultValue);
    onChange?.(defaultValue ?? {});
  });

  const segments = mergeValues<SegmentType[]>(
    () => {
      const g = granularity();
      const hc = hourCycle();
      const list: SegmentType[] = ["hour"];
      if (g === "minute" || g === "second") list.push("minute");
      if (g === "second") list.push("second");
      if (hc === 12) list.push("dayPeriod");
      return list;
    },
    { parents: [granularity, hourCycle] },
  );

  const formattedValue = mergeValues(
    () =>
      formatTime(
        internalValue(),
        hourCycle(),
        granularity(),
        forceLeadingZeros(),
        translations,
      ),
    { parents: [internalValue, hourCycle, granularity, forceLeadingZeros] },
  );

  const segmentElements = new Map<SegmentType, HTMLElement>();
  const enteredKeys = new Map<SegmentType, string>();

  const registerSegmentRef = (
    segment: SegmentType,
    el: HTMLElement | null,
  ) => {
    if (el) segmentElements.set(segment, el);
    else segmentElements.delete(segment);
  };

  const focusNext = (currentSegment: SegmentType) => {
    const list = segments();
    const idx = list.indexOf(currentSegment);
    if (idx !== -1 && idx < list.length - 1) {
      const nextSeg = list[idx + 1];
      segmentElements.get(nextSeg)?.focus();
    }
  };

  const focusPrevious = (currentSegment: SegmentType) => {
    const list = segments();
    const idx = list.indexOf(currentSegment);
    if (idx > 0) {
      const prevSeg = list[idx - 1];
      segmentElements.get(prevSeg)?.focus();
    }
  };

  const setValue = (patch: Partial<Time> | undefined) => {
    if (formControl.isDisabled() || formControl.isReadOnly()) return;

    if (!patch) {
      internalValue(undefined);
      return;
    }

    const current = internalValue() ?? {};
    const updated: Time = {
      hour: "hour" in patch ? patch.hour : current.hour,
      minute: "minute" in patch ? patch.minute : current.minute,
      second: "second" in patch ? patch.second : current.second,
    };

    internalValue(updated);
    onChange?.(updated);
  };

  const getSegmentValue = (segment: SegmentType): number | string | undefined => {
    const time = internalValue() ?? placeholder;
    if (!time) return undefined;

    if (segment === "dayPeriod") {
      const h = time.hour ?? 0;
      return h >= 12 ? translations.pm : translations.am;
    }

    if (segment === "hour") {
      const h = time.hour;
      if (h === undefined) return undefined;
      if (hourCycle() === 12) {
        if (h > 12) return h - 12;
        if (h === 0) return 12;
      }
      return h;
    }

    return time[segment];
  };

  const getSegmentText = (segment: SegmentType): string => {
    if (segment === "dayPeriod") {
      const val = getSegmentValue("dayPeriod");
      return (val as string) ?? translations.am;
    }

    const val = getSegmentValue(segment);
    if (val === undefined) {
      return "--";
    }

    const pad =
      segment !== "hour"
        ? 2
        : forceLeadingZeros() || hourCycle() === 24
          ? 2
          : 1;

    return String(val).padStart(pad, "0");
  };

  const adjustSegment = (segment: SegmentType, delta: number) => {
    if (formControl.isDisabled() || formControl.isReadOnly()) return;
    enteredKeys.set(segment, "");

    const time = internalValue() ?? placeholder ?? { hour: 0, minute: 0, second: 0 };

    if (segment === "dayPeriod") {
      const curH = time.hour ?? 0;
      const nextH = curH >= 12 ? curH - 12 : curH + 12;
      setValue({ hour: nextH });
      return;
    }

    if (segment === "hour") {
      const curH = time.hour ?? 0;
      if (hourCycle() === 12) {
        const isPM = curH >= 12;
        const h12 = curH % 12;
        const next12 = (h12 + delta + 12) % 12;
        const resolved = next12 + (isPM ? 12 : 0);
        setValue({ hour: resolved });
      } else {
        const next = (curH + delta + 24) % 24;
        setValue({ hour: next });
      }
      return;
    }

    const curVal = (time[segment] ?? 0);
    const nextVal = (curVal + delta + 60) % 60;
    setValue({ [segment]: nextVal });
  };

  const setSegmentMin = (segment: SegmentType) => {
    if (formControl.isDisabled() || formControl.isReadOnly()) return;
    enteredKeys.set(segment, "");

    if (segment === "dayPeriod") {
      const curH = internalValue()?.hour ?? 0;
      if (curH >= 12) setValue({ hour: curH - 12 });
      return;
    }
    if (segment === "hour" && hourCycle() === 12) {
      const curH = internalValue()?.hour ?? 0;
      setValue({ hour: curH >= 12 ? 13 : 1 });
      return;
    }
    setValue({ [segment]: 0 });
  };

  const setSegmentMax = (segment: SegmentType) => {
    if (formControl.isDisabled() || formControl.isReadOnly()) return;
    enteredKeys.set(segment, "");

    if (segment === "dayPeriod") {
      const curH = internalValue()?.hour ?? 0;
      if (curH < 12) setValue({ hour: curH + 12 });
      return;
    }
    if (segment === "hour") {
      if (hourCycle() === 12) {
        const curH = internalValue()?.hour ?? 0;
        setValue({ hour: curH >= 12 ? 12 : 0 });
      } else {
        setValue({ hour: 23 });
      }
      return;
    }
    setValue({ [segment]: 59 });
  };

  const handleSegmentKeyInput = (segment: SegmentType, key: string): boolean => {
    if (formControl.isDisabled() || formControl.isReadOnly()) return false;

    if (segment === "dayPeriod") {
      const k = key.toLowerCase();
      const amChar = translations.am.charAt(0).toLowerCase();
      const pmChar = translations.pm.charAt(0).toLowerCase();

      if (k === "a" || k === amChar) {
        const curH = internalValue()?.hour ?? 0;
        if (curH >= 12) setValue({ hour: curH - 12 });
        focusNext("dayPeriod");
        return true;
      }
      if (k === "p" || k === pmChar) {
        const curH = internalValue()?.hour ?? 0;
        if (curH < 12) setValue({ hour: curH + 12 });
        focusNext("dayPeriod");
        return true;
      }
      return false;
    }

    if (!/^\d$/.test(key)) return false;

    const maxVal = segment === "hour" ? (hourCycle() === 12 ? 12 : 23) : 59;
    let currentKeys = (enteredKeys.get(segment) ?? "") + key;
    let num = Number.parseInt(currentKeys, 10);

    if (num > maxVal) {
      currentKeys = key;
      num = Number.parseInt(key, 10);
    }

    let resolvedNum = num;
    if (segment === "hour" && hourCycle() === 12) {
      const curH = internalValue()?.hour ?? 0;
      const isPM = curH >= 12;
      if (isPM && num < 12) resolvedNum = num + 12;
      else if (!isPM && num === 12) resolvedNum = 0;
    }

    setValue({ [segment]: resolvedNum });

    if (num * 10 > maxVal || currentKeys.length >= 2) {
      enteredKeys.set(segment, "");
      focusNext(segment);
    } else {
      enteredKeys.set(segment, currentKeys);
    }

    return true;
  };

  const handleSegmentBackspace = (segment: SegmentType) => {
    if (formControl.isDisabled() || formControl.isReadOnly()) return;

    if (segment === "dayPeriod") {
      focusPrevious("dayPeriod");
      return;
    }

    const currentVal = internalValue()?.[segment];
    if (currentVal === undefined) {
      focusPrevious(segment);
      return;
    }

    enteredKeys.set(segment, "");
    setValue({ [segment]: undefined });
  };

  return {
    value: internalValue.as((v) => v),
    setValue,
    formattedValue,
    hourCycle,
    granularity,
    forceLeadingZeros,
    placeholder,
    min,
    max,
    translations,
    segments,
    formControl,
    isDisabled: formControl.isDisabled,
    isReadOnly: formControl.isReadOnly,
    isRequired: formControl.isRequired,
    validationState: formControl.validationState,
    inputRef,
    registerSegmentRef,
    focusNext,
    focusPrevious,
    getSegmentValue,
    getSegmentText,
    adjustSegment,
    setSegmentMin,
    setSegmentMax,
    handleSegmentKeyInput,
    handleSegmentBackspace,
  };
}
