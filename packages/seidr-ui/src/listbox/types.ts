import type {
  DerivedValue,
  ObservableValue,
  ReactiveValue,
  SeidrChild,
  SeidrElementProps,
  SeidrElementTagNameMap,
  Value,
} from "@fimbul-works/seidr";

/** Selection modes supported by Listbox. */
export type ListboxSelectionMode = "single" | "multiple" | "none";

/** Visual orientation of the listbox. */
export type ListboxOrientation = "vertical" | "horizontal";

/** High-level data item definition for options rendered in Listbox. */
export interface ListboxItemData<T = any> {
  type?: "item";
  value: string;
  label?: SeidrChild;
  textValue?: string;
  disabled?: boolean;
  description?: SeidrChild;
  rawValue?: T;
}

/** High-level section definition for grouped options rendered in Listbox. */
export interface ListboxSectionData<T = any> {
  type: "section";
  key: string;
  label: SeidrChild;
  items: ListboxItemData<T>[];
  rawValue?: T;
}

export type ListboxNode<T = any> = ListboxItemData<T> | ListboxSectionData<T>;

/** Alias for backward compatibility */
export type ListboxOptionItem<T = any> = ListboxItemData<T>;

/** Configuration options for the headless `useListbox` hook. */
export interface UseListboxOptions {
  /** Optional custom ID for the listbox container. */
  id?: string;

  /**
   * The type of selection allowed.
   * @default "single"
   */
  selectionMode?: ListboxSelectionMode;

  /** Controlled selected value(s). */
  value?: ReactiveValue<string | string[] | Set<string>>;

  /** Initial selected value(s) for uncontrolled mode. */
  defaultValue?: string | string[] | Set<string>;

  /** Callback fired when the selection changes. */
  onChange?: (value: any) => void;

  /** Alias callback fired when the selection changes. */
  onValueChange?: (value: any) => void;

  /** Whether empty selection is disallowed. */
  disallowEmptySelection?: boolean;

  /**
   * Whether focus should wrap around when reaching the start/end of the list.
   * @default true
   */
  shouldFocusWrap?: boolean;

  /**
   * Whether options should receive focus/highlight on pointer hover.
   * @default true
   */
  shouldFocusOnHover?: boolean;

  /**
   * The axis along which keyboard navigation moves.
   * @default "vertical"
   */
  orientation?: ListboxOrientation;

  /** Whether the entire listbox is disabled. */
  disabled?: boolean | ObservableValue<boolean>;

  /** Whether typeahead searching is disabled. */
  disallowTypeAhead?: boolean;

  /** Whether the listbox or initial option should be automatically focused. */
  autoFocus?: boolean;
}

/** Registration record for an individual listbox option element. */
export interface ListboxItemRegistration {
  value: string;
  el: HTMLElement;
  isItemDisabled: () => boolean;
  textValue: () => string;
}

/** Return interface of `useListbox`. */
export interface UseListboxResult {
  /** Root identifier of the listbox. */
  id: string;

  /** Visual orientation. */
  orientation: ListboxOrientation;

  /** Active selection mode. */
  selectionMode: ListboxSelectionMode;

  /** Whether keyboard navigation wraps at bounds. */
  shouldFocusWrap: boolean;

  /** Whether hover moves focus. */
  shouldFocusOnHover: boolean;

  /** Whether typeahead is disabled. */
  disallowTypeAhead: boolean;

  /** Reactive array of selected string keys. */
  selectedValues: Value<string[]>;

  /** Reactive key of currently highlighted/focused item. */
  highlightedValue: Value<string | null>;

  /** Derived boolean indicating whether listbox is disabled. */
  isDisabled: DerivedValue<boolean>;

  /** Check if a specific item is selected. */
  isSelected: (value: string) => DerivedValue<boolean>;

  /** Check if a specific item is highlighted. */
  isHighlighted: (value: string) => DerivedValue<boolean>;

  /** Get the roving tab index for an item. */
  getItemTabIndex: (value: string, isItemDisabled: () => boolean) => DerivedValue<number>;

  /** Toggle or select a specific item value. */
  toggleOrSelect: (value: string) => void;

  /** Update the highlighted item value. */
  highlightValue: (value: string | null) => void;

  /** Register an item element into the listbox coordinator. */
  registerItem: (entry: ListboxItemRegistration) => () => void;

  /** Keydown handler to attach to root or handle bubbling keyboard events. */
  handleRootKeyDown: (e: KeyboardEvent) => void;

  /** Keydown handler to attach directly to an item option. */
  handleItemKeyDown: (e: KeyboardEvent, value: string) => void;

  /** Focus handler for the root element to focus the active item. */
  handleRootFocus: (e: FocusEvent) => void;
}

/** Options for configuring an individual listbox item state. */
export interface UseListboxItemOptions {
  value: string;
  disabled?: boolean | ObservableValue<boolean>;
  textValue?: string;
  id?: string;
}

/** Return interface of `useListboxItem`. */
export interface UseListboxItemResult {
  id: string;
  value: string;
  isSelected: DerivedValue<boolean>;
  isHighlighted: DerivedValue<boolean>;
  isDisabled: DerivedValue<boolean>;
  tabIndex: DerivedValue<number>;
  labelId: Value<string | undefined>;
  descriptionId: Value<string | undefined>;
  registerLabelId: (id: string) => () => void;
  registerDescriptionId: (id: string) => () => void;
  listbox: UseListboxResult;
}

// ---------------------------------------------------------------------------
// Subcomponent Props
// ---------------------------------------------------------------------------

export interface ListboxRootOptions<T extends keyof SeidrElementTagNameMap = "ul"> {
  as?: T;
  instance?: UseListboxResult;
  dataComponent?: string;
  role?: string;
  onfocusin?: (e: FocusEvent) => void;
}

export type ListboxRootProps<T extends keyof SeidrElementTagNameMap = "ul"> = ListboxRootOptions<T> &
  Omit<SeidrElementProps<T>, keyof ListboxRootOptions<T>>;

export interface ListboxItemOptions<T extends keyof SeidrElementTagNameMap = "li"> {
  as?: T;
  instance?: UseListboxItemResult;
  listbox?: UseListboxResult;
  value: string;
  disabled?: boolean | ObservableValue<boolean>;
  textValue?: string;
  dataComponent?: string;
  role?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  label?: SeidrChild;
  description?: SeidrChild;
  indicator?: SeidrChild;
}

export type ListboxItemProps<T extends keyof SeidrElementTagNameMap = "li"> = ListboxItemOptions<T> &
  Omit<SeidrElementProps<T>, keyof ListboxItemOptions<T>>;

export interface ListboxItemLabelOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  as?: T;
  instance?: UseListboxItemResult;
  dataComponent?: string;
}

export type ListboxItemLabelProps<T extends keyof SeidrElementTagNameMap = "div"> = ListboxItemLabelOptions<T> &
  Omit<SeidrElementProps<T>, keyof ListboxItemLabelOptions<T>>;

export interface ListboxItemDescriptionOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  as?: T;
  instance?: UseListboxItemResult;
  dataComponent?: string;
}

export type ListboxItemDescriptionProps<T extends keyof SeidrElementTagNameMap = "div"> =
  ListboxItemDescriptionOptions<T> & Omit<SeidrElementProps<T>, keyof ListboxItemDescriptionOptions<T>>;

export interface ListboxItemIndicatorOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  as?: T;
  instance?: UseListboxItemResult;
  forceMount?: boolean;
  dataComponent?: string;
}

export type ListboxItemIndicatorProps<T extends keyof SeidrElementTagNameMap = "div"> = ListboxItemIndicatorOptions<T> &
  Omit<SeidrElementProps<T>, keyof ListboxItemIndicatorOptions<T>>;

export interface ListboxSectionOptions<T extends keyof SeidrElementTagNameMap = "li"> {
  as?: T;
  dataComponent?: string;
  role?: string;
}

export type ListboxSectionProps<T extends keyof SeidrElementTagNameMap = "li"> = ListboxSectionOptions<T> &
  Omit<SeidrElementProps<T>, keyof ListboxSectionOptions<T>>;

export interface ListboxSectionLabelOptions<T extends keyof SeidrElementTagNameMap = "span"> {
  as?: T;
  dataComponent?: string;
  role?: string;
}

export type ListboxSectionLabelProps<T extends keyof SeidrElementTagNameMap = "span"> = ListboxSectionLabelOptions<T> &
  Omit<SeidrElementProps<T>, keyof ListboxSectionLabelOptions<T>>;

// ---------------------------------------------------------------------------
// Coordinator & Tier Types
// ---------------------------------------------------------------------------

export interface ListboxBoundItemHelpers {
  Root: <T extends keyof SeidrElementTagNameMap = "li">(
    props?: Omit<ListboxItemProps<T>, "instance" | "value">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  Item: <T extends keyof SeidrElementTagNameMap = "li">(
    props?: Omit<ListboxItemProps<T>, "instance" | "value">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  Label: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: Omit<ListboxItemLabelProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  ItemLabel: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: Omit<ListboxItemLabelProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  Description: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: Omit<ListboxItemDescriptionProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  ItemDescription: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: Omit<ListboxItemDescriptionProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  Indicator: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: Omit<ListboxItemIndicatorProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => DerivedValue<SeidrElementTagNameMap[T] | null>;
  ItemIndicator: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: Omit<ListboxItemIndicatorProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => DerivedValue<SeidrElementTagNameMap[T] | null>;
}

export interface ListboxItemInstance extends UseListboxItemResult, ListboxBoundItemHelpers {}

export interface ListboxListRenderOptions {
  renderItem?: (
    itemValue: Value<ListboxItemData>,
    key: string,
    item: ListboxItemInstance,
  ) => SeidrChild;
  renderSection?: (sectionValue: Value<ListboxSectionData>, key: string) => SeidrChild;
  indicator?: SeidrChild;
  itemProps?: Record<string, any>;
}

/** Tier 2 Coordinator instance returned by `createListbox`. */
export interface ListboxInstance extends UseListboxResult {
  createItem: (options: UseListboxItemOptions) => ListboxItemInstance;

  Root: <T extends keyof SeidrElementTagNameMap = "ul">(
    props?: Omit<ListboxRootProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  Item: <T extends keyof SeidrElementTagNameMap = "li">(
    props: Omit<ListboxItemProps<T>, "instance"> & { value: string },
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  ItemLabel: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: Omit<ListboxItemLabelProps<T>, "instance"> & { instance?: UseListboxItemResult },
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  ItemDescription: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: Omit<ListboxItemDescriptionProps<T>, "instance"> & { instance?: UseListboxItemResult },
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  ItemIndicator: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: Omit<ListboxItemIndicatorProps<T>, "instance"> & { instance?: UseListboxItemResult },
    children?: SeidrChild | SeidrChild[],
  ) => DerivedValue<SeidrElementTagNameMap[T] | null>;

  Section: <T extends keyof SeidrElementTagNameMap = "li">(
    props?: ListboxSectionProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  SectionLabel: <T extends keyof SeidrElementTagNameMap = "span">(
    props?: ListboxSectionLabelProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  List: (
    items: ReactiveValue<ListboxNode[]>,
    options?: ListboxListRenderOptions,
  ) => SeidrChild;
}

/** Tier 1 All-in-One Component Props. */
export interface ListboxOptions<T extends keyof SeidrElementTagNameMap = "ul"> extends UseListboxOptions {
  as?: T;
  items?: ReactiveValue<ListboxNode[]>;
  rootProps?: Omit<ListboxRootProps<T>, "instance" | "as">;
  itemProps?: Record<string, any>;
  indicator?: SeidrChild;
}

export type ListboxProps<T extends keyof SeidrElementTagNameMap = "ul"> = ListboxOptions<T> &
  Omit<SeidrElementProps<T>, keyof ListboxOptions<T>>;
