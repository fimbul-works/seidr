import type {
  DerivedValue,
  ReactiveValue,
  SeidrChild,
  SeidrElementProps,
  SeidrElementTagNameMap,
  Value,
} from "@fimbul-works/seidr";
import type {
  ComboboxArrowProps,
  ComboboxContentProps,
  ComboboxControlProps,
  ComboboxDescriptionProps,
  ComboboxErrorMessageProps,
  ComboboxHiddenSelectProps,
  ComboboxIconProps,
  ComboboxInputProps,
  ComboboxItemData,
  ComboboxItemDescriptionProps,
  ComboboxItemIndicatorProps,
  ComboboxItemInstance,
  ComboboxItemLabelProps,
  ComboboxItemProps,
  ComboboxLabelProps,
  ComboboxListboxProps,
  ComboboxNode,
  ComboboxRootProps,
  ComboboxSectionData,
  ComboboxSectionLabelProps,
  ComboboxSectionProps,
  ComboboxTriggerProps,
  UseComboboxOptions,
  UseComboboxResult,
} from "../combobox/types.js";
import type { ListboxListRenderOptions, UseListboxItemOptions } from "../listbox/types.js";

export type SearchItemData<T = any> = ComboboxItemData<T>;
export type SearchSectionData<T = any> = ComboboxSectionData<T>;
export type SearchNode<T = any> = ComboboxNode<T>;

/** Configuration options for the headless `useSearch` hook. */
export interface UseSearchOptions<Option = any, OptGroup = any>
  extends Omit<UseComboboxOptions<Option, OptGroup>, "defaultFilter" | "onInputChange"> {
  /** Debounce milliseconds before making suggestion requests. Defaults to 0 (no debounce). */
  debounceOptionsMillisecond?: number;

  /** Async or sync event handler called when the search query changes. */
  onInputChange?: (value: string) => Promise<void> | void;
}

/** Return interface of `useSearch`. */
export interface UseSearchResult<Option = any> extends UseComboboxResult<Option> {
  /** Reactive state indicating whether async suggestion fetching is currently in progress. */
  isLoadingSuggestions: Value<boolean>;

  /** Derived boolean indicating whether the search returned zero results. */
  noResult: DerivedValue<boolean>;
}

// ---------------------------------------------------------------------------
// Subcomponent Props
// ---------------------------------------------------------------------------

export interface SearchIndicatorOptions<T extends keyof SeidrElementTagNameMap = "span"> {
  as?: T;
  instance?: UseSearchResult;
  dataComponent?: string;
  loadingComponent?: SeidrChild;
}

export type SearchIndicatorProps<T extends keyof SeidrElementTagNameMap = "span"> = SearchIndicatorOptions<T> &
  Omit<SeidrElementProps<T>, keyof SearchIndicatorOptions<T>>;

export interface SearchNoResultOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  as?: T;
  instance?: UseSearchResult;
  dataComponent?: string;
}

export type SearchNoResultProps<T extends keyof SeidrElementTagNameMap = "div"> = SearchNoResultOptions<T> &
  Omit<SeidrElementProps<T>, keyof SearchNoResultOptions<T>>;

export type SearchRootProps<T extends keyof SeidrElementTagNameMap = "div"> = ComboboxRootProps<T>;
export type SearchLabelProps<T extends keyof SeidrElementTagNameMap = "label"> = ComboboxLabelProps<T>;
export type SearchControlProps<T extends keyof SeidrElementTagNameMap = "div"> = ComboboxControlProps<T>;
export type SearchInputProps<T extends keyof SeidrElementTagNameMap = "input"> = ComboboxInputProps<T>;
export type SearchTriggerProps<T extends keyof SeidrElementTagNameMap = "button"> = ComboboxTriggerProps<T>;
export type SearchIconProps<T extends keyof SeidrElementTagNameMap = "span"> = ComboboxIconProps<T>;
export type SearchContentProps<T extends keyof SeidrElementTagNameMap = "div"> = ComboboxContentProps<T>;
export type SearchListboxProps<T extends keyof SeidrElementTagNameMap = "ul"> = ComboboxListboxProps<T>;
export type SearchItemProps<T extends keyof SeidrElementTagNameMap = "li"> = ComboboxItemProps<T>;
export type SearchItemLabelProps<T extends keyof SeidrElementTagNameMap = "div"> = ComboboxItemLabelProps<T>;
export type SearchItemDescriptionProps<T extends keyof SeidrElementTagNameMap = "div"> =
  ComboboxItemDescriptionProps<T>;
export type SearchItemIndicatorProps<T extends keyof SeidrElementTagNameMap = "div"> = ComboboxItemIndicatorProps<T>;
export type SearchSectionProps<T extends keyof SeidrElementTagNameMap = "li"> = ComboboxSectionProps<T>;
export type SearchSectionLabelProps<T extends keyof SeidrElementTagNameMap = "span"> = ComboboxSectionLabelProps<T>;
export type SearchHiddenSelectProps = ComboboxHiddenSelectProps;
export type SearchDescriptionProps<T extends keyof SeidrElementTagNameMap = "div"> = ComboboxDescriptionProps<T>;
export type SearchErrorMessageProps<T extends keyof SeidrElementTagNameMap = "div"> = ComboboxErrorMessageProps<T>;
export type SearchArrowProps<T extends keyof SeidrElementTagNameMap = "div"> = ComboboxArrowProps<T>;

export interface SearchItemInstance extends ComboboxItemInstance {}

/** Compound instance returned by `createSearch`. */
export interface SearchInstance<Option = any> extends UseSearchResult<Option> {
  createItem: (options: UseListboxItemOptions) => SearchItemInstance;

  Root: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: SearchRootProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  Label: <T extends keyof SeidrElementTagNameMap = "label">(
    props?: SearchLabelProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  Control: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: SearchControlProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  Input: <T extends keyof SeidrElementTagNameMap = "input">(
    props?: SearchInputProps<T>,
  ) => SeidrElementTagNameMap[T];

  Trigger: <T extends keyof SeidrElementTagNameMap = "button">(
    props?: SearchTriggerProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  Icon: <T extends keyof SeidrElementTagNameMap = "span">(
    props?: SearchIconProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  Indicator: <T extends keyof SeidrElementTagNameMap = "span">(
    props?: SearchIndicatorProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  NoResult: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: SearchNoResultProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => DerivedValue<SeidrElementTagNameMap[T] | null>;

  Content: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: SearchContentProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => DerivedValue<SeidrElementTagNameMap[T] | null>;

  Listbox: <T extends keyof SeidrElementTagNameMap = "ul">(
    props?: SearchListboxProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  Item: <T extends keyof SeidrElementTagNameMap = "li">(
    props: SearchItemProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  ItemLabel: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: SearchItemLabelProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  ItemDescription: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: SearchItemDescriptionProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  ItemIndicator: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: SearchItemIndicatorProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => DerivedValue<SeidrElementTagNameMap[T] | null>;

  Section: <T extends keyof SeidrElementTagNameMap = "li">(
    props?: SearchSectionProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  SectionLabel: <T extends keyof SeidrElementTagNameMap = "span">(
    props?: SearchSectionLabelProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  HiddenSelect: (props?: SearchHiddenSelectProps) => SeidrElementTagNameMap["select"];

  Arrow: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: SearchArrowProps<T>,
  ) => SeidrElementTagNameMap[T];

  Description: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: SearchDescriptionProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  ErrorMessage: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: SearchErrorMessageProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => DerivedValue<SeidrElementTagNameMap[T] | null>;

  List: (
    items: ReactiveValue<SearchNode<Option>[]>,
    options?: ListboxListRenderOptions,
  ) => SeidrChild;
}

// ---------------------------------------------------------------------------
// Tier 1 All-in-One Component Props
// ---------------------------------------------------------------------------

export interface SearchProps<Option = any, OptGroup = any> extends UseSearchOptions<Option, OptGroup> {
  label?: SeidrChild;
  description?: SeidrChild;
  errorMessage?: SeidrChild;
  indicator?: SeidrChild;
  loadingIndicator?: SeidrChild;
  noResult?: SeidrChild;
  inputProps?: Omit<SearchInputProps<"input">, "instance">;
  triggerProps?: Omit<SearchTriggerProps<"button">, "instance">;
  controlProps?: Omit<SearchControlProps<"div">, "instance">;
  contentProps?: Omit<SearchContentProps<"div">, "instance">;
  listboxProps?: Omit<SearchListboxProps<"ul">, "instance">;
  rootProps?: Omit<SearchRootProps<"div">, "instance">;
  hiddenSelectProps?: Omit<SearchHiddenSelectProps, "instance">;
  itemProps?: Partial<SearchItemProps<"li">>;
}

