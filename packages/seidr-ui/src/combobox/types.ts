import type {
  DerivedValue,
  ObservableValue,
  ReactiveValue,
  Ref,
  SeidrChild,
  SeidrElementProps,
  SeidrElementTagNameMap,
  Value,
} from "@fimbul-works/seidr";
import type { FormControlDescriptionProps } from "../form-control/form-control-description.js";
import type { FormControlErrorMessageProps } from "../form-control/form-control-error-message.js";
import type { ValidationState } from "../form-control/types.js";
import type {
  ListboxBoundItemHelpers,
  ListboxItemData,
  ListboxItemDescriptionProps,
  ListboxItemIndicatorProps,
  ListboxItemInstance,
  ListboxItemLabelProps,
  ListboxItemProps,
  ListboxListRenderOptions,
  ListboxNode,
  ListboxSectionData,
  ListboxSectionLabelProps,
  ListboxSectionProps,
  UseListboxItemOptions,
  UseListboxItemResult,
  UseListboxResult,
} from "../listbox/types.js";
import type { PopperArrowProps, UsePopperOptions, UsePopperResult } from "../popper/types.js";

export type ComboboxItemData<T = any> = ListboxItemData<T>;
export type ComboboxSectionData<T = any> = ListboxSectionData<T>;
export type ComboboxNode<T = any> = ListboxNode<T>;

export type ComboboxTriggerMode = "input" | "focus" | "manual";

export type ComboboxFilter<Option = any> =
  | "contains"
  | "startsWith"
  | "endsWith"
  | ((item: ComboboxItemData<Option>, query: string) => boolean);

/** Configuration options for the headless `useCombobox` hook. */
export interface UseComboboxOptions<Option = any, OptGroup = any>
  extends Omit<UsePopperOptions, "anchorRef" | "contentRef"> {
  /** Optional custom ID for the combobox container. */
  id?: string;

  /** The controlled open state of the dropdown. */
  open?: ReactiveValue<boolean>;

  /** Default open state for uncontrolled mode. */
  defaultOpen?: boolean;

  /** Event handler called when the open state changes. */
  onOpenChange?: (isOpen: boolean, triggerMode?: ComboboxTriggerMode) => void;

  /** The controlled value of the combobox (selected value(s)). */
  value?: ReactiveValue<string | string[] | Option | Option[] | null>;

  /** Default value for uncontrolled mode. */
  defaultValue?: string | string[] | Option | Option[];

  /** Event handler called when the selected value changes. */
  onChange?: (value: any) => void;

  /** Controlled text value of the `<input>` element. */
  inputValue?: ReactiveValue<string>;

  /** Default input value for uncontrolled mode. */
  defaultInputValue?: string;

  /** Event handler called when the input text value changes. */
  onInputChange?: (value: string) => void;

  /** Array of available options or section groups (can be reactive). */
  options: ReactiveValue<ComboboxNode<Option>[]>;

  /**
   * The interaction mode required to open the dropdown.
   * @default "input"
   */
  triggerMode?: ComboboxTriggerMode;

  /**
   * The filter function or algorithm used to match options against the input text.
   * @default "contains"
   */
  defaultFilter?: ComboboxFilter<Option>;

  /** Whether the menu allows opening when the collection is empty. */
  allowsEmptyCollection?: boolean;

  /** Whether empty selection is disallowed. */
  disallowEmptySelection?: boolean;

  /**
   * Whether the dropdown closes after an item is selected.
   * Defaults to true in single-select mode, false in multi-select mode.
   */
  closeOnSelection?: boolean;

  /**
   * Whether pressing Backspace in an empty input removes the last selected item (in multi-select mode).
   * @default true
   */
  removeOnBackspace?: boolean;

  /** Whether to prevent resetting input value on blur. */
  noResetInputOnBlur?: boolean;

  /** Whether multi-selection is enabled. */
  multiple?: boolean;

  /** Whether keyboard navigation wraps at bounds. */
  shouldFocusWrap?: boolean;

  /** Whether the combobox is disabled. */
  disabled?: ReactiveValue<boolean>;

  /** Whether the combobox is read-only. */
  readOnly?: ReactiveValue<boolean>;

  /** Whether the combobox is required in form submission. */
  required?: ReactiveValue<boolean>;

  /** Form field name for form submission. */
  name?: string;

  /** Validation state: "valid" | "invalid" | undefined. */
  validationState?: ReactiveValue<ValidationState | undefined>;

  /** Content or text to display when no option is selected. */
  placeholder?: SeidrChild;

  /** Whether to keep the content mounted when closed (e.g. for CSS exit transitions). */
  forceMount?: boolean;

  /** Optional target element to portal the dropdown content into (e.g. `getDocument().body`). */
  portalTarget?: HTMLElement;
}

/** Return interface of `useCombobox`. */
export interface UseComboboxResult<Option = any> {
  /** Unique component ID. */
  id: string;

  /** Child IDs for ARIA linkage. */
  controlId: string;
  inputId: string;
  triggerId: string;
  listboxId: string;
  labelId: string;
  descriptionId: string;
  errorMessageId: string;

  /** DOM Element Refs. */
  controlRef: Ref<HTMLElement>;
  inputRef: Ref<HTMLInputElement>;
  triggerRef: Ref<HTMLElement>;
  contentRef: Ref<HTMLElement>;
  listboxRef: Ref<HTMLElement>;

  /** Reactive open state. */
  isOpen: Value<boolean>;

  /** Open the dropdown. */
  open: (focusStrategy?: "first" | "last" | boolean, triggerMode?: ComboboxTriggerMode) => void;

  /** Close the dropdown. */
  close: () => void;

  /** Toggle the dropdown open state. */
  toggle: (focusStrategy?: "first" | "last" | boolean, triggerMode?: ComboboxTriggerMode) => void;

  /** Input value reactive state. */
  inputValue: Value<string>;

  /** Set input text value directly. */
  setInputValue: (value: string) => void;

  /** Resets input value to reflect currently selected option(s). */
  resetInputValue: () => void;

  /** Whether combobox is disabled. */
  isDisabled: DerivedValue<boolean>;

  /** Whether combobox is read-only. */
  isReadOnly: DerivedValue<boolean>;

  /** Whether combobox is required. */
  isRequired: DerivedValue<boolean>;

  /** Whether multi-selection is enabled. */
  isMultiple: boolean;

  /** Form field name. */
  name?: string;

  /** Validation state. */
  validationState: ObservableValue<ValidationState | undefined>;

  /** Placeholder text/content. */
  placeholder?: SeidrChild;

  /** Whether current selection is empty. */
  isEmpty: DerivedValue<boolean>;

  /** All available options (unfiltered). */
  allOptions: DerivedValue<ComboboxNode<Option>[]>;

  /** Currently displayed/filtered options. */
  displayedOptions: DerivedValue<ComboboxNode<Option>[]>;

  /** Currently selected option items. */
  selectedOptions: DerivedValue<ComboboxItemData<Option>[]>;

  /** Remove an option from the current selection. */
  remove: (option: ComboboxItemData<Option> | string) => void;

  /** Clear all selections. */
  clear: () => void;

  /** Underlying listbox controller. */
  listbox: UseListboxResult;

  /** Underlying popper controller. */
  popper: UsePopperResult;

  /** Whether content is force mounted. */
  forceMount: boolean;

  /** Optional target element to portal the dropdown content into. */
  portalTarget?: HTMLElement;

  /** Dynamic ARIA active descendant ID for the focused listbox item. */
  activeDescendantId: DerivedValue<string | undefined>;

  /** Event handlers. */
  handleInput: (e: Event) => void;
  handleInputKeyDown: (e: KeyboardEvent) => void;
  handleInputFocus: (e: FocusEvent) => void;
  handleInputBlur: (e: FocusEvent) => void;
  handleInputClick: (e: MouseEvent) => void;
  handleTriggerPointerDown: (e: PointerEvent) => void;
  handleTriggerClick: (e: MouseEvent) => void;
}

// ---------------------------------------------------------------------------
// Subcomponent Props
// ---------------------------------------------------------------------------

export interface ComboboxRootOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  as?: T;
  instance?: UseComboboxResult;
  dataComponent?: string;
}

export type ComboboxRootProps<T extends keyof SeidrElementTagNameMap = "div"> = ComboboxRootOptions<T> &
  Omit<SeidrElementProps<T>, keyof ComboboxRootOptions<T>>;

export interface ComboboxLabelOptions<T extends keyof SeidrElementTagNameMap = "label"> {
  as?: T;
  instance?: UseComboboxResult;
  dataComponent?: string;
}

export type ComboboxLabelProps<T extends keyof SeidrElementTagNameMap = "label"> = ComboboxLabelOptions<T> &
  Omit<SeidrElementProps<T>, keyof ComboboxLabelOptions<T>>;

export interface ComboboxControlOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  as?: T;
  instance?: UseComboboxResult;
  dataComponent?: string;
}

export type ComboboxControlProps<T extends keyof SeidrElementTagNameMap = "div"> = ComboboxControlOptions<T> &
  Omit<SeidrElementProps<T>, keyof ComboboxControlOptions<T>>;

export interface ComboboxInputOptions<T extends keyof SeidrElementTagNameMap = "input"> {
  as?: T;
  instance?: UseComboboxResult;
  dataComponent?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
}

export type ComboboxInputProps<T extends keyof SeidrElementTagNameMap = "input"> = ComboboxInputOptions<T> &
  Omit<SeidrElementProps<T>, keyof ComboboxInputOptions<T>>;

export interface ComboboxTriggerOptions<T extends keyof SeidrElementTagNameMap = "button"> {
  as?: T;
  instance?: UseComboboxResult;
  dataComponent?: string;
  ariaLabel?: string;
}

export type ComboboxTriggerProps<T extends keyof SeidrElementTagNameMap = "button"> = ComboboxTriggerOptions<T> &
  Omit<SeidrElementProps<T>, keyof ComboboxTriggerOptions<T>>;

export interface ComboboxIconOptions<T extends keyof SeidrElementTagNameMap = "span"> {
  as?: T;
  instance?: UseComboboxResult;
  dataComponent?: string;
}

export type ComboboxIconProps<T extends keyof SeidrElementTagNameMap = "span"> = ComboboxIconOptions<T> &
  Omit<SeidrElementProps<T>, keyof ComboboxIconOptions<T>>;

export interface ComboboxContentOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  as?: T;
  instance?: UseComboboxResult;
  dataComponent?: string;
  /** Optional target element to portal the content into. Overrides `instance.portalTarget`. */
  portalTarget?: HTMLElement;
}

export interface ComboboxPortalProps {
  /** Target element to portal into. Defaults to `instance.portalTarget ?? getDocument().body`. */
  target?: HTMLElement;
  instance?: UseComboboxResult;
}

export type ComboboxContentProps<T extends keyof SeidrElementTagNameMap = "div"> = ComboboxContentOptions<T> &
  Omit<SeidrElementProps<T>, keyof ComboboxContentOptions<T>>;

export interface ComboboxListboxOptions<T extends keyof SeidrElementTagNameMap = "ul"> {
  as?: T;
  instance?: UseComboboxResult;
  dataComponent?: string;
  onfocusin?: (e: FocusEvent) => void;
}

export type ComboboxListboxProps<T extends keyof SeidrElementTagNameMap = "ul"> = ComboboxListboxOptions<T> &
  Omit<SeidrElementProps<T>, keyof ComboboxListboxOptions<T>>;

export type ComboboxItemProps<T extends keyof SeidrElementTagNameMap = "li"> = ListboxItemProps<T>;
export type ComboboxItemLabelProps<T extends keyof SeidrElementTagNameMap = "div"> = ListboxItemLabelProps<T>;
export type ComboboxItemDescriptionProps<T extends keyof SeidrElementTagNameMap = "div"> =
  ListboxItemDescriptionProps<T>;
export type ComboboxItemIndicatorProps<T extends keyof SeidrElementTagNameMap = "div"> = ListboxItemIndicatorProps<T>;
export type ComboboxSectionProps<T extends keyof SeidrElementTagNameMap = "li"> = ListboxSectionProps<T>;
export type ComboboxSectionLabelProps<T extends keyof SeidrElementTagNameMap = "span"> = ListboxSectionLabelProps<T>;

export interface ComboboxHiddenSelectOptions {
  instance?: UseComboboxResult;
  dataComponent?: string;
}

export type ComboboxHiddenSelectProps = ComboboxHiddenSelectOptions &
  Omit<SeidrElementProps<"select">, keyof ComboboxHiddenSelectOptions>;

export type ComboboxDescriptionProps<T extends keyof SeidrElementTagNameMap = "div"> = FormControlDescriptionProps<T>;
export type ComboboxErrorMessageProps<T extends keyof SeidrElementTagNameMap = "div"> =
  FormControlErrorMessageProps<T>;
export type ComboboxArrowProps<T extends keyof SeidrElementTagNameMap = "div"> = PopperArrowProps<T>;

// ---------------------------------------------------------------------------
// Instance Coordinators
// ---------------------------------------------------------------------------

export interface ComboboxBoundItemHelpers extends ListboxBoundItemHelpers {}

export interface ComboboxItemInstance extends ListboxItemInstance {}

/** Compound instance returned by `createCombobox`. */
export interface ComboboxInstance<Option = any> extends UseComboboxResult<Option> {
  createItem: (options: UseListboxItemOptions) => ComboboxItemInstance;

  Root: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: ComboboxRootProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  Label: <T extends keyof SeidrElementTagNameMap = "label">(
    props?: ComboboxLabelProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  Control: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: ComboboxControlProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  Input: <T extends keyof SeidrElementTagNameMap = "input">(
    props?: ComboboxInputProps<T>,
  ) => SeidrElementTagNameMap[T];

  Trigger: <T extends keyof SeidrElementTagNameMap = "button">(
    props?: ComboboxTriggerProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  Icon: <T extends keyof SeidrElementTagNameMap = "span">(
    props?: ComboboxIconProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  Portal: (props?: ComboboxPortalProps, children?: SeidrChild | SeidrChild[]) => SeidrChild;

  Content: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: ComboboxContentProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => DerivedValue<SeidrElementTagNameMap[T] | null>;

  Listbox: <T extends keyof SeidrElementTagNameMap = "ul">(
    props?: ComboboxListboxProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  Item: <T extends keyof SeidrElementTagNameMap = "li">(
    props: ComboboxItemProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  ItemLabel: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: ComboboxItemLabelProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  ItemDescription: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: ComboboxItemDescriptionProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  ItemIndicator: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: ComboboxItemIndicatorProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => DerivedValue<SeidrElementTagNameMap[T] | null>;

  Section: <T extends keyof SeidrElementTagNameMap = "li">(
    props?: ComboboxSectionProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  SectionLabel: <T extends keyof SeidrElementTagNameMap = "span">(
    props?: ComboboxSectionLabelProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  HiddenSelect: (props?: ComboboxHiddenSelectProps) => SeidrElementTagNameMap["select"];

  Arrow: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: ComboboxArrowProps<T>,
  ) => SeidrElementTagNameMap[T];

  Description: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: ComboboxDescriptionProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  ErrorMessage: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: ComboboxErrorMessageProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => DerivedValue<SeidrElementTagNameMap[T] | null>;

  List: (
    items: ReactiveValue<ComboboxNode<Option>[]>,
    options?: ListboxListRenderOptions,
  ) => SeidrChild;
}

// ---------------------------------------------------------------------------
// Tier 1 All-in-One Component Props
// ---------------------------------------------------------------------------

export interface ComboboxProps<Option = any, OptGroup = any> extends UseComboboxOptions<Option, OptGroup> {
  label?: SeidrChild;
  description?: SeidrChild;
  errorMessage?: SeidrChild;
  indicator?: SeidrChild;
  inputProps?: Omit<ComboboxInputProps<"input">, "instance">;
  triggerProps?: Omit<ComboboxTriggerProps<"button">, "instance">;
  controlProps?: Omit<ComboboxControlProps<"div">, "instance">;
  contentProps?: Omit<ComboboxContentProps<"div">, "instance">;
  listboxProps?: Omit<ComboboxListboxProps<"ul">, "instance">;
  rootProps?: Omit<ComboboxRootProps<"div">, "instance">;
  hiddenSelectProps?: Omit<ComboboxHiddenSelectProps, "instance">;
  itemProps?: Partial<ComboboxItemProps<"li">>;
}

