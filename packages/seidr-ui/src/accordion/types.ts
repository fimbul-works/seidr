import type {
  CleanupFunction,
  DerivedValue,
  ObservableValue,
  ReactiveValue,
  SeidrChild,
  SeidrElementProps,
  SeidrElementTagNameMap,
} from "@fimbul-works/seidr";
import type { CollapsibleAnimationOptions, UseCollapsibleResult } from "../collapsible/types.js";

export interface AccordionDataSet {
  "data-expanded": ObservableValue<string | undefined>;
  "data-closed": ObservableValue<string | undefined>;
  "data-disabled": ObservableValue<string | undefined>;
}

export interface UseAccordionOptions {
  /** The controlled value of the accordion item(s) to expand. */
  value?: ReactiveValue<string[]>;

  /** The value of the accordion item(s) to expand when initially rendered. */
  defaultValue?: string[];

  /** Event handler called when the expanded item(s) change. */
  onChange?: (value: string[]) => void;

  /** Whether multiple items can be opened at the same time. @default false */
  multiple?: boolean;

  /** When `multiple` is false, allows closing content when clicking trigger for an open item. @default false */
  collapsible?: boolean;

  /** Whether keyboard focus should wrap around when reaching the start or end. @default true */
  shouldFocusWrap?: boolean;

  /** Unique base ID for the accordion. */
  id?: string;

  /** Animation configuration using Flaedi, or false to disable JS tweening. */
  animation?: boolean | CollapsibleAnimationOptions;
}

export interface UseAccordionResult {
  /** The base ID of the accordion. */
  id: string;

  /** The derived read-only array of expanded item values. */
  value: DerivedValue<string[]>;

  /** Whether multiple items can be opened simultaneously. */
  multiple: boolean;

  /** Whether an active item can be collapsed in single-selection mode. */
  collapsible: boolean;

  /** Whether arrow key navigation wraps around. */
  shouldFocusWrap: boolean;

  /** Sets the active expanded item keys. */
  setValue: (keys: string[]) => void;

  /** Returns whether the item with the given key is currently expanded. */
  isOpen: (key: string) => DerivedValue<boolean>;

  /** Toggles the expansion state of the item with the given key. */
  toggle: (key: string) => void;

  /** Expands the item with the given key. */
  expand: (key: string) => void;

  /** Collapses the item with the given key. */
  collapse: (key: string) => void;

  /** Registers a trigger button into the accordion's focus order. */
  registerTrigger: (
    key: string,
    el: HTMLElement,
    disabled?: boolean | ObservableValue<boolean>,
  ) => CleanupFunction;

  /** Handles arrow and home/end keyboard navigation between accordion triggers. */
  handleKeyDown: (e: KeyboardEvent, key: string) => void;
}

export interface AccordionItemOptions {
  /** A unique value for the item. */
  value: string;

  /** Whether the item is disabled. */
  disabled?: ReactiveValue<boolean>;

  /** Whether to keep the item content mounted in the DOM when collapsed. */
  forceMount?: ObservableValue<boolean>;

  /** Unique ID for the item. */
  id?: string;
}

export interface AccordionItemInstance {
  /** The item's unique key. */
  value: string;

  /** The derived read-only expansion state for this item. */
  isOpen: DerivedValue<boolean>;

  /** The derived read-only disabled state for this item. */
  isDisabled: ObservableValue<boolean>;

  /** The reactive trigger ID for this item. */
  triggerId: ObservableValue<string>;

  /** The reactive content region ID for this item. */
  contentId: ObservableValue<string>;

  /** Reactive data-* attributes for the item parts. */
  dataset: AccordionDataSet;

  /** The underlying Collapsible coordinator for this item. */
  collapsibleInstance: UseCollapsibleResult;

  /** Toggles this item's expansion state. */
  toggle: () => void;

  /** The parent Accordion coordinator. */
  accordion: UseAccordionResult;
}

export interface AccordionItemBoundHelpers {
  /** Pre-bound AccordionItem container. */
  Root: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: SeidrElementProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Pre-bound AccordionItem container (alias for Root). */
  Item: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: SeidrElementProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Pre-bound AccordionHeader element. */
  Header: <T extends keyof SeidrElementTagNameMap = "h3">(
    props?: SeidrElementProps<T> & { as?: T },
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Pre-bound AccordionTrigger button. */
  Trigger: <T extends keyof SeidrElementTagNameMap = "button">(
    props?: SeidrElementProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Pre-bound AccordionContent disclosure region. */
  Content: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: SeidrElementProps<T> & { as?: T },
    children?: SeidrChild | SeidrChild[],
  ) => DerivedValue<SeidrElementTagNameMap[T] | null>;
}

export interface AccordionItemDescriptor {
  /** Unique key value for the item. */
  value: string;

  /** The header trigger content. */
  trigger: SeidrChild | SeidrChild[];

  /** The expandable panel content. */
  content: SeidrChild | SeidrChild[];

  /** Whether the item is disabled. */
  disabled?: boolean | ObservableValue<boolean>;

  /** Tag name for the header element. @default "h3" */
  headerAs?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

  /** Element properties for the item container. */
  itemProps?: SeidrElementProps<"div">;

  /** Element properties for the header element. */
  headerProps?: SeidrElementProps<"h3">;

  /** Element properties for the trigger button. */
  triggerProps?: SeidrElementProps<"button">;

  /** Element properties for the content region. */
  contentProps?: SeidrElementProps<"div">;

  /** Animation configuration using Flaedi, or false to disable JS tweening. */
  animation?: boolean | CollapsibleAnimationOptions;
}

export interface AccordionInstance extends UseAccordionResult {
  /** Pre-bound AccordionRoot container. */
  Root: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: SeidrElementProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /**
   * Pre-bound compound AccordionItem helper.
   * Renders the item with its Header, Trigger, and Content when descriptor props are provided,
   * or accepts custom children for fine-grained sculpting.
   */
  Item: <T extends keyof SeidrElementTagNameMap = "div">(
    optionsOrProps: AccordionItemOptions & {
      trigger?: SeidrChild | SeidrChild[];
      content?: SeidrChild | SeidrChild[];
      headerAs?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
      itemProps?: SeidrElementProps<T>;
      headerProps?: SeidrElementProps<"h3">;
      triggerProps?: SeidrElementProps<"button">;
      contentProps?: SeidrElementProps<"div">;
      animation?: boolean | CollapsibleAnimationOptions;
    } & SeidrElementProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Pre-bound AccordionHeader element. */
  Header: <T extends keyof SeidrElementTagNameMap = "h3">(
    props?: SeidrElementProps<T> & { instance?: AccordionItemInstance; as?: T },
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Pre-bound AccordionTrigger button. */
  Trigger: <T extends keyof SeidrElementTagNameMap = "button">(
    props?: SeidrElementProps<T> & { instance?: AccordionItemInstance },
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Pre-bound AccordionContent disclosure region. */
  Content: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: SeidrElementProps<T> & { instance?: AccordionItemInstance; as?: T },
    children?: SeidrChild | SeidrChild[],
  ) => DerivedValue<SeidrElementTagNameMap[T] | null>;

  /** Creates an item-level coordinator with pre-bound item helpers for fine-grained DOM sculpting. */
  createItem: (options: AccordionItemOptions) => AccordionItemInstance & AccordionItemBoundHelpers;
}

export type AccordionProps<T extends keyof SeidrElementTagNameMap = "div"> = UseAccordionOptions &
  SeidrElementProps<T> & {
    /** High-level list of accordion items to render automatically. */
    items?: AccordionItemDescriptor[];
  };
