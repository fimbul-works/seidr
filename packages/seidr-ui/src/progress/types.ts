import type {
  DerivedValue,
  ReactiveStyleDeclaration,
  ReactiveValue,
  SeidrChild,
  SeidrElementProps,
  SeidrElementTagNameMap,
} from "@fimbul-works/seidr";

export interface GetProgressValueLabelParams {
  value: number;
  min: number;
  max: number;
}

export interface UseProgressOptions {
  /** The unique ID of the progress bar. */
  id?: string;

  /** Current numeric value. */
  value?: ReactiveValue<number>;

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
   * Whether the progress is in an indeterminate state.
   * @default false
   */
  indeterminate?: ReactiveValue<boolean>;

  /** Custom formatter for the displayed value text. */
  getValueLabel?: (params: GetProgressValueLabelParams) => string;

  /**
   * WAI-ARIA role for the component root.
   * @default "progressbar"
   */
  role?: "progressbar" | "meter";

  /**
   * Component semantic name for CSS annotations.
   * @default "progress"
   */
  dataComponent?: string;
}

export interface UseProgressResult {
  /** Unique identifier for the progress element. */
  id: string;

  /** WAI-ARIA role for the component root. */
  role: "progressbar" | "meter";

  /** Component semantic name for CSS annotations. */
  dataComponent: string;

  /** Read-only derived observable of current clamped value. Callable as a getter: value() -> number. */
  value: DerivedValue<number>;

  /** Derived percentage (0 to 1). Callable as getter: valuePercent() -> number. */
  valuePercent: DerivedValue<number>;

  /** Derived formatted text label for the current value (e.g. "45%"). */
  valueLabel: DerivedValue<string | undefined>;

  /** Read-only derived indeterminate state. */
  isIndeterminate: DerivedValue<boolean>;

  /** Progress completion state: "loading" | "complete" | undefined. */
  progressState: DerivedValue<"loading" | "complete" | undefined>;

  /** Minimum permitted value. */
  minValue: number;

  /** Maximum permitted value. */
  maxValue: number;

  /** CSS fill width string: "45%" (or undefined when indeterminate). */
  fillWidth: DerivedValue<string | undefined>;
}

export type ProgressInstance = UseProgressResult & {
  Root: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: Omit<ProgressRootProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  Header: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: Omit<ProgressHeaderProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  Track: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: Omit<ProgressTrackProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  Fill: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: Omit<ProgressFillProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  Label: <T extends keyof SeidrElementTagNameMap = "span">(
    props?: Omit<ProgressLabelProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  ValueLabel: <T extends keyof SeidrElementTagNameMap = "span">(
    props?: Omit<ProgressValueLabelProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
};

export interface ProgressSubcomponentProps {
  /** The internal Progress coordinator instance. Required for subcomponents. */
  instance?: UseProgressResult;
  id?: string;
  style?: ReactiveStyleDeclaration;
  role?: "progressbar" | "meter";
  dataComponent?: string;
  ariaLabel?: string;
  ariaLabelledby?: string;
}

export type ProgressRootProps<T extends keyof SeidrElementTagNameMap = "div"> = SeidrElementProps<T> &
  ProgressSubcomponentProps & {
    as?: T;
  };

export type ProgressHeaderProps<T extends keyof SeidrElementTagNameMap = "div"> = SeidrElementProps<T> &
  ProgressSubcomponentProps & {
    as?: T;
  };

export type ProgressTrackProps<T extends keyof SeidrElementTagNameMap = "div"> = SeidrElementProps<T> &
  ProgressSubcomponentProps & {
    as?: T;
  };

export type ProgressFillProps<T extends keyof SeidrElementTagNameMap = "div"> = SeidrElementProps<T> &
  ProgressSubcomponentProps & {
    as?: T;
  };

export type ProgressLabelProps<T extends keyof SeidrElementTagNameMap = "span"> = SeidrElementProps<T> &
  ProgressSubcomponentProps & {
    as?: T;
  };

export type ProgressValueLabelProps<T extends keyof SeidrElementTagNameMap = "span"> = SeidrElementProps<T> &
  ProgressSubcomponentProps & {
    as?: T;
  };

export interface ProgressProps extends UseProgressOptions {
  /** Polymorphic tag name for the root element. Defaults to "div". */
  as?: keyof SeidrElementTagNameMap;

  /** Accessible label text or element. */
  label?: SeidrChild | SeidrChild[];

  /**
   * Whether to display the value label, or custom value label children.
   * When true, displays default percentage text (e.g. "45%").
   */
  valueLabel?: boolean | SeidrChild | SeidrChild[];

  /** Props passed directly to Progress.Root. */
  rootProps?: Omit<ProgressRootProps<"div">, "instance">;

  /** Props passed directly to Progress.Header. */
  headerProps?: Omit<ProgressHeaderProps<"div">, "instance">;

  /** Props passed directly to Progress.Track. */
  trackProps?: Omit<ProgressTrackProps<"div">, "instance">;

  /** Props passed directly to Progress.Fill. */
  fillProps?: Omit<ProgressFillProps<"div">, "instance">;

  /** Props passed directly to Progress.Label. */
  labelProps?: Omit<ProgressLabelProps<"span">, "instance">;

  /** Props passed directly to Progress.ValueLabel. */
  valueLabelProps?: Omit<ProgressValueLabelProps<"span">, "instance">;

  /** Additional children rendered inside Progress.Root. */
  children?: SeidrChild | SeidrChild[];
}
