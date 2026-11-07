import type {
  Time,
  TimeFieldGranularity,
  TimeFieldHourCycle,
  TimeFieldIntlTranslations,
} from "./types.js";

export const DEFAULT_TIME_FIELD_INTL: TimeFieldIntlTranslations = {
  hour: "hour",
  minute: "minute",
  second: "second",
  am: "AM",
  pm: "PM",
  dayPeriod: "AM/PM",
  timeZoneName: "time zone",
  selectedTimeDescription: (time: string) => `Selected Time: ${time}`,
};

export const PAGE_STEP = {
  hour: 2,
  minute: 15,
  second: 15,
};

export function timeToNumber(t?: Time): number {
  if (!t) return 0;
  const h = t.hour ?? 0;
  const m = t.minute ?? 0;
  const s = t.second ?? 0;
  return h * 10000 + m * 100 + s;
}

export function isTimeInRange(
  time: Time | undefined,
  min?: Time,
  max?: Time,
): boolean {
  if (!time) return true;
  const val = timeToNumber(time);
  if (min !== undefined && val < timeToNumber(min)) return false;
  if (max !== undefined && val > timeToNumber(max)) return false;
  return true;
}

export function formatTime(
  time: Time | undefined,
  hourCycle: TimeFieldHourCycle,
  granularity: TimeFieldGranularity,
  forceLeadingZeros: boolean,
  translations: TimeFieldIntlTranslations,
): string {
  if (!time || (time.hour === undefined && time.minute === undefined && time.second === undefined)) {
    return "";
  }

  const parts: string[] = [];
  const rawHour = time.hour ?? 0;
  const isPM = rawHour >= 12;

  let displayHour = rawHour;
  if (hourCycle === 12) {
    if (rawHour > 12) displayHour = rawHour - 12;
    else if (rawHour === 0) displayHour = 12;
  }

  const hourPadding = hourCycle === 24 || forceLeadingZeros ? 2 : 1;
  parts.push(displayHour.toString().padStart(hourPadding, "0"));

  if (granularity === "minute" || granularity === "second") {
    parts.push((time.minute ?? 0).toString().padStart(2, "0"));
  }

  if (granularity === "second") {
    parts.push((time.second ?? 0).toString().padStart(2, "0"));
  }

  let formatted = parts.join(":");
  if (hourCycle === 12) {
    formatted += ` ${isPM ? translations.pm : translations.am}`;
  }

  return formatted;
}

export function parseTime(timeStr: string): Time | undefined {
  if (!timeStr || !timeStr.trim()) return undefined;

  const [timePart, periodPart] = timeStr.trim().split(/\s+/);
  if (!timePart) return undefined;

  const [hStr, mStr, sStr] = timePart.split(":");
  let hour = Number.parseInt(hStr, 10);
  const minute = mStr !== undefined ? Number.parseInt(mStr, 10) : undefined;
  const second = sStr !== undefined ? Number.parseInt(sStr, 10) : undefined;

  if (Number.isNaN(hour)) return undefined;

  if (periodPart) {
    const isPM = periodPart.toUpperCase() === "PM";
    if (isPM && hour < 12) hour += 12;
    else if (!isPM && hour === 12) hour = 0;
  }

  return {
    hour: Number.isNaN(hour) ? undefined : hour,
    minute: Number.isNaN(minute) ? undefined : minute,
    second: Number.isNaN(second) ? undefined : second,
  };
}

