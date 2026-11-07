import type {
  DerivedValue,
  ObservableValue,
  ReactiveValue,
  Ref,
  SeidrChild,
  SeidrElementProps,
  SeidrElementTagNameMap,
} from "@fimbul-works/seidr";
import type {
  UseFormControlOptions,
  UseFormControlResult,
  ValidationState,
} from "../form-control/types.js";

export type TimeFieldGranularity = "hour" | "minute" | "second";

export type TimeFieldHourCycle = 12 | 24;

export type SegmentType = "hour" | "minute" | "second" | "dayPeriod";

export interface Time {
  hour?: number;
  minute?: number;
  second?: number;
}

export interface TimeFieldIntlTranslations {
  hour: string;
  minute: string;
  second: string;
  am: string;
  pm: string;
  dayPeriod: string;
  timeZoneName: string;
  selectedTimeDescription: (time: string) => string;
}

export interface UseTimeFieldOptions extends UseFormControlOptions {
  /** The current time value (controlled). */
  value?: ReactiveValue<Time | undefined>;
  /** The default time value (uncontrolled). */
  defaultValue?: Time;
  /** Handler called when the time value changes. */
  onChange?: (value: Time) => void;
  /** Whether to display time in 12 or 24 hour cycle. Defaults to 12. */
  hourCycle?: ReactiveValue<TimeFieldHourCycle>;
  /** Smallest unit displayed. Defaults to "minute". */
  granularity?: ReactiveValue<TimeFieldGranularity>;
  /** Whether hours always show leading zero (e.g. 09 vs 9). Defaults to false. */
  forceLeadingZeros?: ReactiveValue<boolean>;
  /** Placeholder time shown when no value is selected. */
  placeholder?: Time;
  /** Minimum allowed time value. */
  min?: Time;
  /** Maximum allowed time value. */
  max?: Time;
  /** Localized translation dictionary. */
  translations?: Partial<TimeFieldIntlTranslations>;
}

export interface UseTimeFieldResult {
  /** Read-only reactive current time. */
  value: DerivedValue<Time | undefined>;
  /** Updates the time value. */
  setValue: (value: Partial<Time> | undefined) => void;
  /** Formatted time string (e.g. "02:30 PM" or "14:30"). */
  formattedValue: DerivedValue<string>;
  /** Reactive hour cycle (12 or 24). */
  hourCycle: ObservableValue<TimeFieldHourCycle>;
  /** Reactive granularity. */
  granularity: ObservableValue<TimeFieldGranularity>;
  /** Reactive forceLeadingZeros flag. */
  forceLeadingZeros: ObservableValue<boolean>;
  /** Placeholder time. */
  placeholder?: Time;
  /** Minimum time boundary. */
  min?: Time;
  /** Maximum time boundary. */
  max?: Time;
  /** Localized translations. */
  translations: TimeFieldIntlTranslations;
  /** Reactive array of active segments based on granularity and hourCycle. */
  segments: DerivedValue<SegmentType[]>;
  /** Underlying form control coordinator. */
  formControl: UseFormControlResult;
  /** Derived disabled state. */
  isDisabled: ObservableValue<boolean>;
  /** Derived read-only state. */
  isReadOnly: ObservableValue<boolean>;
  /** Derived required state. */
  isRequired: ObservableValue<boolean>;
  /** Derived validation state ("valid" | "invalid" | undefined). */
  validationState: ObservableValue<ValidationState | undefined>;
  /** Reference to the segments input container. */
  inputRef: Ref<HTMLElement>;
  /** Registers a DOM element for a given segment token to support keyboard focus shifting. */
  registerSegmentRef: (segment: SegmentType, el: HTMLElement | null) => void;
  /** Moves keyboard focus to the next segment token. */
  focusNext: (currentSegment: SegmentType) => void;
  /** Moves keyboard focus to the previous segment token. */
  focusPrevious: (currentSegment: SegmentType) => void;
  /** Returns the numeric or string value for a given segment. */
  getSegmentValue: (segment: SegmentType) => number | string | undefined;
  /** Returns the formatted text displayed for a given segment. */
  getSegmentText: (segment: SegmentType) => string;
  /** Adjusts the value of a segment by a delta (step). */
  adjustSegment: (segment: SegmentType, delta: number) => void;
  /** Sets a segment to its minimum value. */
  setSegmentMin: (segment: SegmentType) => void;
  /** Sets a segment to its maximum value. */
  setSegmentMax: (segment: SegmentType) => void;
  /** Handles typing digits or AM/PM keys into a segment. Returns true if key was handled. */
  handleSegmentKeyInput: (segment: SegmentType, key: string) => boolean;
  /** Handles Backspace key on a segment. */
  handleSegmentBackspace: (segment: SegmentType) => void;
}

// ---------------------------------------------------------------------------
// Subcomponent Options & Props
// ---------------------------------------------------------------------------

export interface TimeFieldRootOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  as?: T;
  instance?: UseTimeFieldResult;
  dataComponent?: string;
  children?: SeidrChild | SeidrChild[];
}
export type TimeFieldRootProps<T extends keyof SeidrElementTagNameMap = "div"> =
  TimeFieldRootOptions<T> & SeidrElementProps<T>;

export interface TimeFieldLabelOptions<T extends keyof SeidrElementTagNameMap = "label"> {
  as?: T;
  instance?: UseTimeFieldResult;
  dataComponent?: string;
  for?: string;
  htmlFor?: string;
  children?: SeidrChild | SeidrChild[];
}
export type TimeFieldLabelProps<T extends keyof SeidrElementTagNameMap = "label"> =
  TimeFieldLabelOptions<T> & SeidrElementProps<T>;

export interface TimeFieldInputOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  as?: T;
  instance?: UseTimeFieldResult;
  dataComponent?: string;
  children?: SeidrChild | SeidrChild[];
}
export type TimeFieldInputProps<T extends keyof SeidrElementTagNameMap = "div"> =
  TimeFieldInputOptions<T> & SeidrElementProps<T>;

export interface TimeFieldSegmentOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  as?: T;
  instance?: UseTimeFieldResult;
  segment: SegmentType;
  dataComponent?: string;
  children?: SeidrChild | SeidrChild[];
}
export type TimeFieldSegmentProps<T extends keyof SeidrElementTagNameMap = "div"> =
  TimeFieldSegmentOptions<T> & SeidrElementProps<T>;

export interface TimeFieldSeparatorOptions<T extends keyof SeidrElementTagNameMap = "span"> {
  as?: T;
  instance?: UseTimeFieldResult;
  dataComponent?: string;
  children?: SeidrChild | SeidrChild[];
}
export type TimeFieldSeparatorProps<T extends keyof SeidrElementTagNameMap = "span"> =
  TimeFieldSeparatorOptions<T> & SeidrElementProps<T>;

export interface TimeFieldHiddenInputOptions {
  instance?: UseTimeFieldResult;
  dataComponent?: string;
}
export type TimeFieldHiddenInputProps = TimeFieldHiddenInputOptions &
  Omit<SeidrElementProps<"input">, "type">;

export interface TimeFieldValueDescriptionOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  as?: T;
  instance?: UseTimeFieldResult;
  dataComponent?: string;
  children?: SeidrChild | SeidrChild[];
}
export type TimeFieldValueDescriptionProps<T extends keyof SeidrElementTagNameMap = "div"> =
  TimeFieldValueDescriptionOptions<T> & SeidrElementProps<T>;

export interface TimeFieldDescriptionOptions<T extends keyof SeidrElementTagNameMap = "span"> {
  as?: T;
  instance?: UseTimeFieldResult;
  dataComponent?: string;
  children?: SeidrChild | SeidrChild[];
}
export type TimeFieldDescriptionProps<T extends keyof SeidrElementTagNameMap = "span"> =
  TimeFieldDescriptionOptions<T> & SeidrElementProps<T>;

export interface TimeFieldErrorMessageOptions<T extends keyof SeidrElementTagNameMap = "span"> {
  as?: T;
  instance?: UseTimeFieldResult;
  dataComponent?: string;
  children?: SeidrChild | SeidrChild[];
}
export type TimeFieldErrorMessageProps<T extends keyof SeidrElementTagNameMap = "span"> =
  TimeFieldErrorMessageOptions<T> & SeidrElementProps<T>;

// ---------------------------------------------------------------------------
// Coordinator Instance (Tier 2) & High-Level Component Props (Tier 1)
// ---------------------------------------------------------------------------

export interface TimeFieldInstance extends UseTimeFieldResult {
  Root: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: TimeFieldRootProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  Label: <T extends keyof SeidrElementTagNameMap = "label">(
    props?: TimeFieldLabelProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  Input: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: TimeFieldInputProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  Segment: <T extends keyof SeidrElementTagNameMap = "div">(
    props: TimeFieldSegmentProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  Separator: <T extends keyof SeidrElementTagNameMap = "span">(
    props?: TimeFieldSeparatorProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  HiddenInput: (
    props?: TimeFieldHiddenInputProps,
  ) => HTMLInputElement;
  ValueDescription: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: TimeFieldValueDescriptionProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  Description: <T extends keyof SeidrElementTagNameMap = "span">(
    props?: TimeFieldDescriptionProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  ErrorMessage: <T extends keyof SeidrElementTagNameMap = "span">(
    props?: TimeFieldErrorMessageProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
}

export type TimeFieldProps<T extends keyof SeidrElementTagNameMap = "div"> =
  UseTimeFieldOptions & {
    as?: T;
    label?: SeidrChild;
    description?: SeidrChild;
    errorMessage?: SeidrChild;
    rootProps?: TimeFieldRootProps<T>;
    labelProps?: TimeFieldLabelProps<"label">;
    inputProps?: TimeFieldInputProps<"div">;
    hiddenInputProps?: TimeFieldHiddenInputProps;
    children?: SeidrChild | SeidrChild[];
  } & Omit<SeidrElementProps<T>, "children" | "id">;

