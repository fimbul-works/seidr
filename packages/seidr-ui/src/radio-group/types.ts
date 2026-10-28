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
import type { RadioGroupDescriptionProps } from "./radio-group-description.js";
import type { RadioGroupErrorMessageProps } from "./radio-group-error-message.js";
import type { RadioGroupItemProps } from "./radio-group-item.js";
import type { RadioGroupItemControlProps } from "./radio-group-item-control.js";
import type { RadioGroupItemDescriptionProps } from "./radio-group-item-description.js";
import type { RadioGroupItemIndicatorProps } from "./radio-group-item-indicator.js";
import type { RadioGroupItemInputProps } from "./radio-group-item-input.js";
import type { RadioGroupItemLabelProps } from "./radio-group-item-label.js";
import type { RadioGroupLabelProps } from "./radio-group-label.js";
import type { RadioGroupRootProps } from "./radio-group-root.js";

export type RadioGroupOrientation = "horizontal" | "vertical";

export interface RadioGroupDataSet extends FormControlDataSet {}

export interface RadioGroupItemDataSet extends RadioGroupDataSet {
  "data-checked"?: ObservableValue<string | undefined>;
}

export interface UseRadioGroupOptions extends Omit<UseFormControlOptions, "fieldId"> {
  /**
   * The controlled value of the selected radio button.
   */
  value?: ReactiveValue<string>;

  /**
   * The initial default value when uncontrolled.
   * @default ""
   */
  defaultValue?: string;

  /**
   * Event handler called when the selected radio value changes.
   */
  onChange?: (value: string) => void;

  /**
   * The axis the radio group items should align with.
   * @default "vertical"
   */
  orientation?: RadioGroupOrientation;
}

export interface UseRadioGroupResult {
  /** The unique ID of the radio group. */
  id: DerivedValue<string>;

  /** The group name attribute shared across all radio inputs. */
  name: DerivedValue<string | undefined>;

  /** The reactive read-only selected value of the group. */
  value: DerivedValue<string>;

  /** Reads the current selected value. */
  selectedValue: () => string;

  /** The layout axis orientation. */
  orientation: RadioGroupOrientation;

  /** Sets the selected value if the group is not disabled or readOnly. */
  setSelectedValue: (value: string) => void;

  /** Checks if the given value equals the initial default value. */
  isDefaultValue: (value: string) => boolean;

  /** Checks if the given value is currently selected. */
  isSelectedValue: (value: string) => boolean;

  /** Ref to the radio group root DOM element. */
  rootRef: Ref<HTMLElement>;

  /** Underlying form control state coordinator. */
  formControl: UseFormControlResult;

  /** Visual data-* attributes bound to reactive state. */
  dataset: RadioGroupDataSet;

  /** WAI-ARIA and accessibility props for the root element. */
  ariaProps: ReactiveARIAMixin;
}

export interface UseRadioGroupItemOptions {
  /**
   * The value of the radio button submitted with a form.
   */
  value: string;

  /**
   * Whether this individual radio button is disabled.
   * @default false
   */
  disabled?: boolean;

  /**
   * Optional custom ID for this item container.
   */
  id?: ReactiveValue<string>;
}

export interface UseRadioGroupItemResult {
  /** Unique ID of the radio item container. */
  id: DerivedValue<string>;

  /** Value represented by this radio item. */
  value: string;

  /** Reactive boolean indicating if this radio item is currently selected. */
  isSelected: DerivedValue<boolean>;

  /** Reactive boolean indicating if this radio item is disabled (item disabled OR group disabled). */
  isDisabled: DerivedValue<boolean>;

  /** Reactive boolean indicating if the hidden radio input is currently focused. */
  isFocused: Value<boolean>;

  /** Selects this item if not disabled or readOnly. */
  select: () => void;

  /** Reference to the parent RadioGroup instance. */
  group: UseRadioGroupResult;

  /** Ref to the hidden native radio input element. */
  inputRef: Ref<HTMLInputElement>;

  /** Ref to the visual radio control element. */
  controlRef: Ref<HTMLElement>;

  /** Visual data-* attributes for the item and its subcomponents. */
  dataset: RadioGroupItemDataSet;

  /** Attributes and handlers bound to the native radio input. */
  fieldProps: SeidrElementProps<"input">;

  /** ID for the input element. */
  inputId: DerivedValue<string>;

  /** ID for the label element. */
  labelId: DerivedValue<string>;

  /** ID for the description element. */
  descriptionId: DerivedValue<string>;
}

export interface RadioGroupItemDescriptor {
  /** The value of the radio item. */
  value: string;

  /** The accessible label text or element. */
  label?: SeidrChild | SeidrChild[];

  /** Optional description text or element. */
  description?: SeidrChild | SeidrChild[];

  /** Whether this individual item is disabled. */
  disabled?: boolean;

  /** Optional custom indicator element. */
  indicator?: SeidrChild | SeidrChild[];

  /** Props passed to Item container. */
  itemProps?: RadioGroupItemProps<any>;

  /** Props passed to ItemInput. */
  inputProps?: RadioGroupItemInputProps;

  /** Props passed to ItemControl. */
  controlProps?: RadioGroupItemControlProps<any>;

  /** Props passed to ItemIndicator. */
  indicatorProps?: RadioGroupItemIndicatorProps<any>;

  /** Props passed to ItemLabel. */
  labelProps?: RadioGroupItemLabelProps<any>;

  /** Props passed to ItemDescription. */
  descriptionProps?: RadioGroupItemDescriptionProps<any>;
}

export interface RadioGroupProps extends UseRadioGroupOptions {
  /** Optional class name for the root container. */
  className?: string;

  /** Accessible group label text or element. */
  label?: SeidrChild | SeidrChild[];

  /** Optional group description text or element. */
  description?: SeidrChild | SeidrChild[];

  /** Optional group error message text or element. */
  errorMessage?: SeidrChild | SeidrChild[];

  /** Declarative list of items to render, supports static arrays or reactive observable arrays. */
  items?: ReactiveValue<RadioGroupItemDescriptor[]>;

  /** Props passed to RadioGroup.Root. */
  rootProps?: RadioGroupRootProps<any>;

  /** Props passed to RadioGroup.Label. */
  labelProps?: RadioGroupLabelProps<any>;

  /** Props passed to RadioGroup.Description. */
  descriptionProps?: RadioGroupDescriptionProps<any>;

  /** Props passed to RadioGroup.ErrorMessage. */
  errorMessageProps?: RadioGroupErrorMessageProps<any>;
}

export interface RadioGroupItemInstance extends UseRadioGroupItemResult {
  Root: <T extends keyof SeidrElementTagNameMap = "div">(
    propsOrChildren?: RadioGroupItemProps<T> | SeidrChild | SeidrChild[] | null,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  Input: (props?: RadioGroupItemInputProps) => HTMLInputElement;
  Control: <T extends keyof SeidrElementTagNameMap = "div">(
    propsOrChildren?: RadioGroupItemControlProps<T> | SeidrChild | SeidrChild[] | null,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  Indicator: <T extends keyof SeidrElementTagNameMap = "div">(
    propsOrChildren?: RadioGroupItemIndicatorProps<T> | SeidrChild | SeidrChild[] | null,
    children?: SeidrChild | SeidrChild[],
  ) => DerivedValue<SeidrElementTagNameMap[T] | null>;
  Label: <T extends keyof SeidrElementTagNameMap = "label">(
    propsOrChildren?: RadioGroupItemLabelProps<T> | SeidrChild | SeidrChild[] | null,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  Description: <T extends keyof SeidrElementTagNameMap = "span">(
    propsOrChildren?: RadioGroupItemDescriptionProps<T> | SeidrChild | SeidrChild[] | null,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
}

export interface RadioGroupInstance extends UseRadioGroupResult {
  Root: <T extends keyof SeidrElementTagNameMap = "div">(
    propsOrChildren?: RadioGroupRootProps<T> | SeidrChild | SeidrChild[] | null,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  Label: <T extends keyof SeidrElementTagNameMap = "span">(
    propsOrChildren?: RadioGroupLabelProps<T> | SeidrChild | SeidrChild[] | null,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  Description: <T extends keyof SeidrElementTagNameMap = "span">(
    propsOrChildren?: RadioGroupDescriptionProps<T> | SeidrChild | SeidrChild[] | null,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  ErrorMessage: <T extends keyof SeidrElementTagNameMap = "span">(
    propsOrChildren?: RadioGroupErrorMessageProps<T> | SeidrChild | SeidrChild[] | null,
    children?: SeidrChild | SeidrChild[],
  ) => DerivedValue<SeidrElementTagNameMap[T] | null>;
  Item: (
    optionsOrProps: UseRadioGroupItemOptions & {
      label?: SeidrChild | SeidrChild[];
      description?: SeidrChild | SeidrChild[];
      indicator?: SeidrChild | SeidrChild[];
      [key: string]: any;
    },
    children?: SeidrChild | SeidrChild[],
  ) => HTMLElement;
  createItem: (options: UseRadioGroupItemOptions) => RadioGroupItemInstance;
  ItemInput: (props?: RadioGroupItemInputProps) => HTMLInputElement;
  ItemControl: <T extends keyof SeidrElementTagNameMap = "div">(
    propsOrChildren?: RadioGroupItemControlProps<T> | SeidrChild | SeidrChild[] | null,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  ItemIndicator: <T extends keyof SeidrElementTagNameMap = "div">(
    propsOrChildren?: RadioGroupItemIndicatorProps<T> | SeidrChild | SeidrChild[] | null,
    children?: SeidrChild | SeidrChild[],
  ) => DerivedValue<SeidrElementTagNameMap[T] | null>;
  ItemLabel: <T extends keyof SeidrElementTagNameMap = "label">(
    propsOrChildren?: RadioGroupItemLabelProps<T> | SeidrChild | SeidrChild[] | null,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  ItemDescription: <T extends keyof SeidrElementTagNameMap = "span">(
    propsOrChildren?: RadioGroupItemDescriptionProps<T> | SeidrChild | SeidrChild[] | null,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
}
