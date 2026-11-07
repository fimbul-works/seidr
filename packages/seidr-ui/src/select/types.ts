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
  ListboxRootProps,
  ListboxSectionData,
  ListboxSectionLabelProps,
  ListboxSectionProps,
  UseListboxItemOptions,
  UseListboxItemResult,
  UseListboxResult,
} from "../listbox/types.js";
import type { PopperArrowProps, UsePopperOptions, UsePopperResult } from "../popper/types.js";

export type SelectItemData<T = any> = ListboxItemData<T>;
export type SelectSectionData<T = any> = ListboxSectionData<T>;
export type SelectNode<T = any> = ListboxNode<T>;
export type SelectOptionItem<T = any> = ListboxItemData<T>;

/** Configuration options for the headless `useSelect` hook. */
export interface UseSelectOptions<Option = any, OptGroup = any>
  extends Omit<UsePopperOptions, "anchorRef" | "contentRef"> {
  /** Optional custom ID for the select container. */
  id?: string;

  /** The controlled open state of the dropdown. */
  open?: ReactiveValue<boolean>;

  /** Default open state for uncontrolled mode. */
  defaultOpen?: boolean;

  /** Callback fired when open state changes. */
  onOpenChange?: (open: boolean) => void;

  /** Options array or reactive observable. */
  options?: ReactiveValue<Array<Option | OptGroup | SelectNode<Option>>>;

  /** Property name or getter to use as value key. */
  optionValue?: keyof Option | ((option: Option) => string);

  /** Property name or getter to use as text value for typeahead. */
  optionTextValue?: keyof Option | ((option: Option) => string);

  /** Property name or getter to use as disabled flag. */
  optionDisabled?: keyof Option | ((option: Option) => boolean);

  /** Property name or getter that refers to children options of an option group. */
  optionGroupChildren?: keyof OptGroup | ((group: OptGroup) => Option[]);

  /** Controlled selected value(s). */
  value?: ReactiveValue<string | string[] | Option | Option[] | null>;

  /** Default selected value(s) for uncontrolled mode. */
  defaultValue?: string | string[] | Option | Option[] | null;

  /** Callback fired when the selected value changes. */
  onChange?: (value: any) => void;

  /** Whether the select allows multiple selections. */
  multiple?: boolean;

  /** Whether the select closes automatically when an item is selected. Defaults to `!multiple`. */
  closeOnSelection?: boolean;

  /** Whether empty selection is disallowed. */
  disallowEmptySelection?: boolean;

  /** Whether focus wraps around when navigating items. Defaults to true. */
  shouldFocusWrap?: boolean;

  /** Whether items receive focus on hover. Defaults to true. */
  shouldFocusOnHover?: boolean;

  /** Whether typeahead searching is disabled. */
  disallowTypeAhead?: boolean;

  /** Whether the select is disabled. */
  disabled?: boolean | ObservableValue<boolean>;

  /** Whether the select is read-only. */
  readOnly?: boolean | ObservableValue<boolean>;

  /** Whether the select is required in a form. */
  required?: boolean | ObservableValue<boolean>;

  /** Validation state of the select. */
  validationState?: "valid" | "invalid";

  /** Name of the select for form submission. */
  name?: string;

  /** Content or text to display when no option is selected. */
  placeholder?: SeidrChild;

  /** Whether to keep the content mounted when closed (e.g. for CSS exit transitions). */
  forceMount?: boolean;

  /** Optional target element to portal the dropdown content into (e.g. `getDocument().body`). */
  portalTarget?: HTMLElement;
}

/** Return interface of `useSelect`. */
export interface UseSelectResult<Option = any> {
  /** Unique component ID. */
  id: string;

  /** Child IDs for ARIA linkage. */
  triggerId: string;
  valueId: string;
  listboxId: string;
  labelId: string;
  descriptionId: string;
  errorMessageId: string;

  /** DOM Element Refs. */
  triggerRef: Ref<HTMLElement>;
  contentRef: Ref<HTMLElement>;
  listboxRef: Ref<HTMLElement>;

  /** Reactive open state. */
  isOpen: Value<boolean>;

  /** Open the dropdown. */
  open: (focusStrategy?: "first" | "last" | boolean) => void;

  /** Close the dropdown. */
  close: () => void;

  /** Toggle the dropdown open state. */
  toggle: (focusStrategy?: "first" | "last" | boolean) => void;

  /** Whether select is disabled. */
  isDisabled: DerivedValue<boolean>;

  /** Whether select is read-only. */
  isReadOnly: DerivedValue<boolean>;

  /** Whether select is required. */
  isRequired: DerivedValue<boolean>;

  /** Whether multi-selection is enabled. */
  isMultiple: boolean;

  /** Form field name. */
  name?: string;

  /** Form validation state. */
  validationState?: "valid" | "invalid";

  /** Placeholder text or child. */
  placeholder?: SeidrChild;

  /** Whether selection is currently empty. */
  isEmpty: DerivedValue<boolean>;

  /** Normalized options observable. */
  normalizedOptions: ObservableValue<SelectNode<Option>[]>;

  /** Headless Listbox coordinator. */
  listbox: UseListboxResult;

  /** Headless Popper coordinator. */
  popper: UsePopperResult;

  /** Whether content should be kept mounted when closed. */
  forceMount: boolean;

  /** Optional target element to portal the dropdown content into. */
  portalTarget?: HTMLElement;

  /** Accessible label computation for the trigger. */
  ariaLabelledBy: DerivedValue<string | undefined>;

  /** Close on selection flag. */
  closeOnSelection: boolean;

  /** Keydown handler for the trigger element. */
  handleTriggerKeyDown: (e: KeyboardEvent) => void;

  /** Pointer down handler for the trigger element. */
  handleTriggerPointerDown: (e: PointerEvent) => void;

  /** Click handler for the trigger element. */
  handleTriggerClick: (e: MouseEvent) => void;
}

// ---------------------------------------------------------------------------
// Subcomponent Props
// ---------------------------------------------------------------------------

export interface SelectRootOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  as?: T;
  instance?: UseSelectResult;
  dataComponent?: string;
  role?: string;
}

export type SelectRootProps<T extends keyof SeidrElementTagNameMap = "div"> = SelectRootOptions<T> &
  Omit<SeidrElementProps<T>, keyof SelectRootOptions<T>>;

export interface SelectLabelOptions<T extends keyof SeidrElementTagNameMap = "span"> {
  as?: T;
  instance?: UseSelectResult;
  dataComponent?: string;
}

export type SelectLabelProps<T extends keyof SeidrElementTagNameMap = "span"> = SelectLabelOptions<T> &
  Omit<SeidrElementProps<T>, keyof SelectLabelOptions<T>>;

export interface SelectTriggerOptions<T extends keyof SeidrElementTagNameMap = "button"> {
  as?: T;
  instance?: UseSelectResult;
  dataComponent?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
}

export type SelectTriggerProps<T extends keyof SeidrElementTagNameMap = "button"> = SelectTriggerOptions<T> &
  Omit<SeidrElementProps<T>, keyof SelectTriggerOptions<T>>;

export interface SelectValueOptions<T extends keyof SeidrElementTagNameMap = "span"> {
  as?: T;
  instance?: UseSelectResult;
  dataComponent?: string;
  placeholder?: SeidrChild;
  formatValue?: (selectedNodes: SelectItemData[]) => SeidrChild;
}

export type SelectValueProps<T extends keyof SeidrElementTagNameMap = "span"> = SelectValueOptions<T> &
  Omit<SeidrElementProps<T>, keyof SelectValueOptions<T>>;

export interface SelectIconOptions<T extends keyof SeidrElementTagNameMap = "span"> {
  as?: T;
  instance?: UseSelectResult;
  dataComponent?: string;
}

export type SelectIconProps<T extends keyof SeidrElementTagNameMap = "span"> = SelectIconOptions<T> &
  Omit<SeidrElementProps<T>, keyof SelectIconOptions<T>>;

export interface SelectContentOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  as?: T;
  instance?: UseSelectResult;
  dataComponent?: string;
  /** Optional target element to portal the content into. Overrides `instance.portalTarget`. */
  portalTarget?: HTMLElement;
}

export interface SelectPortalProps {
  /** Target element to portal into. Defaults to `instance.portalTarget ?? getDocument().body`. */
  target?: HTMLElement;
  instance?: UseSelectResult;
}

export type SelectContentProps<T extends keyof SeidrElementTagNameMap = "div"> = SelectContentOptions<T> &
  Omit<SeidrElementProps<T>, keyof SelectContentOptions<T>>;

export interface SelectListboxOptions<T extends keyof SeidrElementTagNameMap = "ul"> {
  as?: T;
  instance?: UseSelectResult;
  dataComponent?: string;
  onfocusin?: (e: FocusEvent) => void;
}

export type SelectListboxProps<T extends keyof SeidrElementTagNameMap = "ul"> = SelectListboxOptions<T> &
  Omit<SeidrElementProps<T>, keyof SelectListboxOptions<T>>;

export type SelectItemProps<T extends keyof SeidrElementTagNameMap = "li"> = ListboxItemProps<T>;
export type SelectItemLabelProps<T extends keyof SeidrElementTagNameMap = "div"> = ListboxItemLabelProps<T>;
export type SelectItemDescriptionProps<T extends keyof SeidrElementTagNameMap = "div"> =
  ListboxItemDescriptionProps<T>;
export type SelectItemIndicatorProps<T extends keyof SeidrElementTagNameMap = "div"> = ListboxItemIndicatorProps<T>;
export type SelectSectionProps<T extends keyof SeidrElementTagNameMap = "li"> = ListboxSectionProps<T>;
export type SelectSectionLabelProps<T extends keyof SeidrElementTagNameMap = "span"> = ListboxSectionLabelProps<T>;

export interface SelectHiddenSelectOptions {
  instance?: UseSelectResult;
  dataComponent?: string;
}

export type SelectHiddenSelectProps = SelectHiddenSelectOptions &
  Omit<SeidrElementProps<"select">, keyof SelectHiddenSelectOptions>;

export type SelectArrowProps<T extends keyof SeidrElementTagNameMap = "div"> = PopperArrowProps<T>;
export type SelectDescriptionProps<T extends keyof SeidrElementTagNameMap = "div"> = FormControlDescriptionProps<T>;
export type SelectErrorMessageProps<T extends keyof SeidrElementTagNameMap = "div"> = FormControlErrorMessageProps<T>;

// ---------------------------------------------------------------------------
// Tier 2 Coordinator Instance Interface
// ---------------------------------------------------------------------------

export interface SelectInstance<Option = any> extends UseSelectResult<Option> {
  createItem: (options: UseListboxItemOptions) => ListboxItemInstance;

  Root: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: Omit<SelectRootProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  Label: <T extends keyof SeidrElementTagNameMap = "span">(
    props?: Omit<SelectLabelProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  Trigger: <T extends keyof SeidrElementTagNameMap = "button">(
    props?: Omit<SelectTriggerProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  Value: <T extends keyof SeidrElementTagNameMap = "span">(
    props?: Omit<SelectValueProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  Icon: <T extends keyof SeidrElementTagNameMap = "span">(
    props?: Omit<SelectIconProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  Portal: (props?: SelectPortalProps, children?: SeidrChild | SeidrChild[]) => SeidrChild;

  Content: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: Omit<SelectContentProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => DerivedValue<SeidrElementTagNameMap[T] | null>;

  Listbox: <T extends keyof SeidrElementTagNameMap = "ul">(
    props?: Omit<SelectListboxProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  Item: <T extends keyof SeidrElementTagNameMap = "li">(
    props: Omit<SelectItemProps<T>, "instance"> & { value: string },
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  ItemLabel: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: Omit<SelectItemLabelProps<T>, "instance"> & { instance?: UseListboxItemResult },
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  ItemDescription: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: Omit<SelectItemDescriptionProps<T>, "instance"> & { instance?: UseListboxItemResult },
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  ItemIndicator: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: Omit<SelectItemIndicatorProps<T>, "instance"> & { instance?: UseListboxItemResult },
    children?: SeidrChild | SeidrChild[],
  ) => DerivedValue<SeidrElementTagNameMap[T] | null>;

  Section: <T extends keyof SeidrElementTagNameMap = "li">(
    props?: SelectSectionProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  SectionLabel: <T extends keyof SeidrElementTagNameMap = "span">(
    props?: SelectSectionLabelProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  HiddenSelect: (props?: SelectHiddenSelectProps) => SeidrElementTagNameMap["select"];

  Arrow: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: SelectArrowProps<T>,
  ) => SeidrElementTagNameMap[T];

  Description: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: SelectDescriptionProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  ErrorMessage: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: SelectErrorMessageProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => DerivedValue<SeidrElementTagNameMap[T] | null>;

  List: (
    items: ReactiveValue<SelectNode<Option>[]>,
    options?: ListboxListRenderOptions,
  ) => SeidrChild;
}

// ---------------------------------------------------------------------------
// Tier 1 All-in-One Component Props
// ---------------------------------------------------------------------------

export interface SelectProps<Option = any, OptGroup = any> extends UseSelectOptions<Option, OptGroup> {
  label?: SeidrChild;
  description?: SeidrChild;
  errorMessage?: SeidrChild;
  indicator?: SeidrChild;
  rootProps?: Omit<SelectRootProps<"div">, "instance">;
  labelProps?: Omit<SelectLabelProps<"span">, "instance">;
  triggerProps?: Omit<SelectTriggerProps<"button">, "instance">;
  valueProps?: Omit<SelectValueProps<"span">, "instance">;
  iconProps?: Omit<SelectIconProps<"span">, "instance">;
  contentProps?: Omit<SelectContentProps<"div">, "instance">;
  listboxProps?: Omit<SelectListboxProps<"ul">, "instance">;
  itemProps?: Record<string, any>;
}
