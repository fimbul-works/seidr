import type {
  DerivedValue,
  ObservableValue,
  ReactiveARIAMixin,
  ReactiveValue,
  Ref,
  SeidrChild,
  SeidrElementProps,
  SeidrElementTagNameMap,
  Value,
} from "@fimbul-works/seidr";
import type { FormControlDataSet, UseFormControlOptions, UseFormControlResult } from "../form-control/types.js";
import type { UseRadioGroupItemResult } from "../radio-group/types.js";
import type { SegmentedControlDescriptionProps } from "./segmented-control-description.js";
import type { SegmentedControlErrorMessageProps } from "./segmented-control-error-message.js";
import type { SegmentedControlIndicatorProps } from "./segmented-control-indicator.js";
import type { SegmentedControlItemProps } from "./segmented-control-item.js";
import type { SegmentedControlItemControlProps } from "./segmented-control-item-control.js";
import type { SegmentedControlItemDescriptionProps } from "./segmented-control-item-description.js";
import type { SegmentedControlItemIndicatorProps } from "./segmented-control-item-indicator.js";
import type { SegmentedControlItemInputProps } from "./segmented-control-item-input.js";
import type { SegmentedControlItemLabelProps } from "./segmented-control-item-label.js";
import type { SegmentedControlLabelProps } from "./segmented-control-label.js";
import type { SegmentedControlRootProps } from "./segmented-control-root.js";

export type SegmentedControlOrientation = "horizontal" | "vertical";

export interface SegmentedControlDataSet extends FormControlDataSet {}

export interface SegmentedControlItemDataSet extends SegmentedControlDataSet {
  "data-checked"?: ObservableValue<string | undefined>;
}

export interface UseSegmentedControlOptions extends Omit<UseFormControlOptions, "fieldId"> {
  /**
   * The controlled value of the selected segmented control item.
   */
  value?: ReactiveValue<string>;

  /**
   * The initial default value when uncontrolled.
   * @default ""
   */
  defaultValue?: string;

  /**
   * Event handler called when the selected value changes.
   */
  onChange?: (value: string) => void;

  /**
   * The axis the segmented control items should align with.
   * @default "horizontal"
   */
  orientation?: SegmentedControlOrientation;
}

export interface UseSegmentedControlResult {
  /** The unique ID of the segmented control. */
  id: DerivedValue<string>;

  /** The group name attribute shared across all radio inputs. */
  name: DerivedValue<string | undefined>;

  /** The reactive read-only selected value of the group. */
  value: DerivedValue<string>;

  /** Reads the current selected value. */
  selectedValue: () => string;

  /** The layout axis orientation. */
  orientation: SegmentedControlOrientation;

  /** Sets the selected value if the control is not disabled or readOnly. */
  setSelectedValue: (value: string) => void;

  /** Checks if the given value equals the initial default value. */
  isDefaultValue: (value: string) => boolean;

  /** Checks if the given value is currently selected. */
  isSelectedValue: (value: string) => boolean;

  /** Ref to the segmented control root DOM element. */
  rootRef: Ref<HTMLElement>;

  /** Underlying form control state coordinator. */
  formControl: UseFormControlResult;

  /** Visual data-* attributes bound to reactive state. */
  dataset: SegmentedControlDataSet;

  /** WAI-ARIA and accessibility props for the root element. */
  ariaProps: ReactiveARIAMixin;

  /** The currently selected item DOM element, used by the sliding indicator. */
  selectedItemElement: Value<HTMLElement | null>;

  /**
   * Registers a segment item element to track position for the sliding indicator.
   * Returns an unregister cleanup function.
   */
  registerItem: (value: string, el: HTMLElement) => () => void;
}

export interface UseSegmentedControlItemOptions {
  /**
   * The value of the segment item submitted with a form.
   */
  value: string;

  /**
   * Whether this individual segment is disabled.
   * @default false
   */
  disabled?: ReactiveValue<boolean>;

  /**
   * Optional custom ID for this item container.
   */
  id?: ReactiveValue<string>;
}

export interface UseSegmentedControlItemResult extends UseRadioGroupItemResult {
  /** Reference to the parent SegmentedControl instance. */
  segmentedControl: UseSegmentedControlResult;
}

export interface SegmentedControlItemDescriptor {
  /** Optional custom ID for this item container. */
  id?: ReactiveValue<string>;

  /** The value of the segment item. */
  value: string;

  /** The accessible label text or element. */
  label?: SeidrChild | SeidrChild[];

  /** Optional description text or element. */
  description?: SeidrChild | SeidrChild[];

  /** Whether this individual item is disabled. */
  disabled?: ReactiveValue<boolean>;

  /** Optional custom indicator element. */
  indicator?: SeidrChild | SeidrChild[];

  /** Whether to render the visual control pill. Defaults to true. */
  control?: boolean;

  /** Props passed to Item container. */
  itemProps?: SegmentedControlItemProps;

  /** Props passed to ItemInput. */
  inputProps?: SegmentedControlItemInputProps;

  /** Props passed to ItemControl. */
  controlProps?: SegmentedControlItemControlProps;

  /** Props passed to ItemIndicator. */
  indicatorProps?: SegmentedControlItemIndicatorProps;

  /** Props passed to the content wrapper enclosing label and description. */
  contentProps?: SeidrElementProps<"div">;

  /** Props passed to ItemLabel. */
  labelProps?: SegmentedControlItemLabelProps;

  /** Props passed to ItemDescription. */
  descriptionProps?: SegmentedControlItemDescriptionProps;
}

export interface SegmentedControlItemInstance extends UseSegmentedControlItemResult {
  Root: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: SegmentedControlItemProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  Item: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: SegmentedControlItemProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  Input: (props?: SegmentedControlItemInputProps) => HTMLInputElement;
  ItemInput: (props?: SegmentedControlItemInputProps) => HTMLInputElement;
  Control: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: SegmentedControlItemControlProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  ItemControl: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: SegmentedControlItemControlProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  Indicator: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: SegmentedControlItemIndicatorProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => DerivedValue<SeidrElementTagNameMap[T] | null>;
  ItemIndicator: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: SegmentedControlItemIndicatorProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => DerivedValue<SeidrElementTagNameMap[T] | null>;
  Label: <T extends keyof SeidrElementTagNameMap = "label">(
    props?: SegmentedControlItemLabelProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  ItemLabel: <T extends keyof SeidrElementTagNameMap = "label">(
    props?: SegmentedControlItemLabelProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  Description: <T extends keyof SeidrElementTagNameMap = "span">(
    props?: SegmentedControlItemDescriptionProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  ItemDescription: <T extends keyof SeidrElementTagNameMap = "span">(
    props?: SegmentedControlItemDescriptionProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
}

export interface SegmentedControlListRenderOptions {
  renderItem?: (
    itemVal: Value<SegmentedControlItemDescriptor>,
    key: string,
    instance: SegmentedControlItemInstance,
  ) => SeidrChild;
  itemProps?: Partial<SegmentedControlItemDescriptor>;
}

export interface SegmentedControlInstance extends UseSegmentedControlResult {
  createItem: (options: UseSegmentedControlItemOptions) => SegmentedControlItemInstance;
  Root: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: SegmentedControlRootProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  Indicator: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: SegmentedControlIndicatorProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  Label: <T extends keyof SeidrElementTagNameMap = "span">(
    props?: SegmentedControlLabelProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  Description: <T extends keyof SeidrElementTagNameMap = "span">(
    props?: SegmentedControlDescriptionProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  ErrorMessage: <T extends keyof SeidrElementTagNameMap = "span">(
    props?: SegmentedControlErrorMessageProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => DerivedValue<SeidrElementTagNameMap[T] | null>;
  Item: (
    optionsOrProps: SegmentedControlItemDescriptor & Record<string, any>,
    children?: SeidrChild | SeidrChild[],
  ) => HTMLElement;
  ItemInput: (props?: SegmentedControlItemInputProps) => HTMLInputElement;
  ItemControl: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: SegmentedControlItemControlProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  ItemIndicator: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: SegmentedControlItemIndicatorProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => DerivedValue<SeidrElementTagNameMap[T] | null>;
  ItemLabel: <T extends keyof SeidrElementTagNameMap = "label">(
    props?: SegmentedControlItemLabelProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  ItemDescription: <T extends keyof SeidrElementTagNameMap = "span">(
    props?: SegmentedControlItemDescriptionProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  List: (
    items: ReactiveValue<SegmentedControlItemDescriptor[]>,
    options?: SegmentedControlListRenderOptions,
  ) => SeidrChild;
}
