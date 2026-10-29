import type {
  DerivedValue,
  ReactiveValue,
  SeidrChild,
  SeidrElementProps,
  SeidrElementTagNameMap,
  Value,
} from "@fimbul-works/seidr";

export type SliderOrientation = "horizontal" | "vertical";

export interface GetValueLabelParams {
  values: number[];
  min: number;
  max: number;
}

export interface UseSliderOptions {
  /** The unique ID of the slider group. */
  id?: string;

  /** Controlled value(s) of the slider. Can be a single number or an array of numbers. */
  value?: ReactiveValue<number[] | number>;

  /** Default value(s) when uncontrolled. */
  defaultValue?: number[] | number;

  /** Callback fired continuously as slider values mutate during sliding. */
  onChange?: (value: number[]) => void;

  /** Callback fired when an interaction ends (pointer up or keyboard release). */
  onChangeEnd?: (value: number[]) => void;

  /**
   * The minimum value permitted.
   * @default 0
   */
  minValue?: number;

  /**
   * The maximum value permitted.
   * @default 100
   */
  maxValue?: number;

  /**
   * The step increment amount.
   * @default 1
   */
  step?: number;

  /**
   * Minimum number of steps permitted between adjacent thumbs.
   * @default 0
   */
  minStepsBetweenThumbs?: number;

  /**
   * The orientation of the slider.
   * @default "horizontal"
   */
  orientation?: SliderOrientation;

  /**
   * Whether the slider visual progression is inverted.
   * @default false
   */
  inverted?: boolean;

  /** Whether the entire slider is disabled. */
  disabled?: ReactiveValue<boolean>;

  /** Whether the slider is read-only. */
  readOnly?: ReactiveValue<boolean>;

  /** Form field name for native HTML form submission. */
  name?: string;

  /**
   * Formatter function to format current values for display and ARIA.
   */
  getValueLabel?: (params: GetValueLabelParams) => string;
}

export interface SliderDataSet {
  "data-orientation": SliderOrientation;
  "data-disabled"?: "";
  "data-readonly"?: "";
}

export interface UseSliderResult {
  /** Root unique identifier. */
  id: string;

  /** Read-only derived observable of current values array. Callable as a getter: values() -> number[]. */
  values: DerivedValue<number[]>;

  /** Reads the value of a specific thumb. */
  getThumbValue: (index: number) => number;

  /** Updates the value of a specific thumb (guarded against disabled/readonly). */
  setThumbValue: (index: number, value: number) => void;

  /** Derived percentage (0 to 1) for a specific thumb. */
  getThumbPercent: (index: number) => DerivedValue<number>;

  /** Calculates percentage (0 to 1) for an arbitrary value. */
  getValuePercent: (value: number) => number;

  /** Derived formatted text label for the current values. */
  getValueLabel: DerivedValue<string>;

  /** Index of the currently focused or active thumb. */
  focusedThumb: Value<number | undefined>;

  /** Whether a thumb is currently being dragged. */
  isDragging: Value<boolean>;

  /** Configured minimum value. */
  minValue: number;

  /** Configured maximum value. */
  maxValue: number;

  /** Configured step increment. */
  step: number;

  /** Calculated page size (jump amount for PageUp/PageDown). */
  pageSize: number;

  /** Slider orientation. */
  orientation: SliderOrientation;

  /** Whether progression is visually inverted. */
  inverted: boolean;

  /** Read-only derived disabled state. */
  isDisabled: DerivedValue<boolean>;

  /** Read-only derived read-only state. */
  isReadOnly: DerivedValue<boolean>;

  /** Registers the slider track element for geometry calculations. */
  registerTrack: (el: HTMLElement | null) => void;

  /** Reference to the track element. */
  trackElement: Value<HTMLElement | null>;

  /** Pointer down handler for track clicking / dragging. */
  handleTrackPointerDown: (e: PointerEvent) => void;

  /** Pointer down handler for direct thumb dragging. */
  handleThumbPointerDown: (index: number, e: PointerEvent) => void;

  /** Keydown handler for accessible thumb navigation. */
  handleThumbKeyDown: (index: number, e: KeyboardEvent) => void;

  /** Deterministic ID for a thumb. */
  generateThumbId: (index: number) => string;

  /** Deterministic ID for a hidden input. */
  generateInputId: (index: number) => string;

  /** Name attribute for hidden form input. */
  name?: string;

  /** Semantic dataset attributes for root and parts. */
  dataset: SliderDataSet;
}

export type SliderRootProps<T extends keyof SeidrElementTagNameMap = "div"> = SeidrElementProps<T> & {
  as?: T;
  instance?: UseSliderResult;
};

export type SliderTrackProps<T extends keyof SeidrElementTagNameMap = "div"> = SeidrElementProps<T> & {
  as?: T;
  instance?: UseSliderResult;
};

export type SliderFillProps<T extends keyof SeidrElementTagNameMap = "div"> = SeidrElementProps<T> & {
  as?: T;
  instance?: UseSliderResult;
};

export type SliderThumbProps<T extends keyof SeidrElementTagNameMap = "span"> = SeidrElementProps<T> & {
  as?: T;
  index?: number;
  instance?: UseSliderResult;
};

export type SliderInputProps = SeidrElementProps<"input"> & {
  index?: number;
  instance?: UseSliderResult;
};

export type SliderLabelProps<T extends keyof SeidrElementTagNameMap = "label"> = SeidrElementProps<T> & {
  as?: T;
  htmlFor?: string;
  instance?: UseSliderResult;
};

export type SliderValueLabelProps<T extends keyof SeidrElementTagNameMap = "div"> = SeidrElementProps<T> & {
  as?: T;
  instance?: UseSliderResult;
};

export type SliderDescriptionProps<T extends keyof SeidrElementTagNameMap = "div"> = SeidrElementProps<T> & {
  as?: T;
  instance?: UseSliderResult;
};

export type SliderErrorMessageProps<T extends keyof SeidrElementTagNameMap = "div"> = SeidrElementProps<T> & {
  as?: T;
  instance?: UseSliderResult;
};

export interface SliderInstance extends UseSliderResult {
  /** Pre-bound Slider.Root container element (role="group"). */
  Root: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: Omit<SliderRootProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Pre-bound Slider.Track element. */
  Track: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: Omit<SliderTrackProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Pre-bound Slider.Fill range/progress fill element. */
  Fill: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: Omit<SliderFillProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Pre-bound Slider.Thumb draggable handle element (role="slider"). */
  Thumb: <T extends keyof SeidrElementTagNameMap = "span">(
    props?: Omit<SliderThumbProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Pre-bound Slider.Input hidden range input for HTML form submission. */
  Input: (props?: Omit<SliderInputProps, "instance">) => HTMLInputElement;

  /** Pre-bound Slider.Label label element. */
  Label: <T extends keyof SeidrElementTagNameMap = "label">(
    props?: Omit<SliderLabelProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Pre-bound Slider.ValueLabel text element showing current value. */
  ValueLabel: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: Omit<SliderValueLabelProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Pre-bound Slider.Description element. */
  Description: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: Omit<SliderDescriptionProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Pre-bound Slider.ErrorMessage element. */
  ErrorMessage: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: Omit<SliderErrorMessageProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
}

export interface SliderProps<TRoot extends keyof SeidrElementTagNameMap = "div"> extends UseSliderOptions {
  /** HTML element tag name for the root container. */
  as?: TRoot;

  /** Accessible label text or element. */
  label?: SeidrChild | SeidrChild[];

  /** Whether to render the current value label, or custom value label content. */
  valueLabel?: boolean | SeidrChild | SeidrChild[];

  /** Optional description text or element. */
  description?: SeidrChild | SeidrChild[];

  /** Optional error message text or element. */
  errorMessage?: SeidrChild | SeidrChild[];

  /** Number of thumbs to render (default 1, or matching defaultValue/value array length). */
  thumbs?: number;

  /** Props passed to Slider.Root. */
  rootProps?: Partial<SliderRootProps<TRoot>>;

  /** Props passed to Slider.Track. */
  trackProps?: Partial<SliderTrackProps<any>>;

  /** Props passed to Slider.Fill. */
  fillProps?: Partial<SliderFillProps<any>>;

  /** Props passed to Slider.Thumb(s). */
  thumbProps?: Partial<SliderThumbProps<any>>;

  /** Props passed to Slider.Input(s). */
  inputProps?: Partial<SliderInputProps>;

  /** Custom children for composite layout sculpting. */
  children?: SeidrChild | SeidrChild[];
}
