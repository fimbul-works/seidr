import type {
  DerivedValue,
  ObservableValue,
  ReactiveValue,
  Ref,
  SeidrChild,
  SeidrElementProps,
  SeidrElementTagNameMap,
} from "@fimbul-works/seidr";

export type PaginationToken =
  | {
      type: "page";
      page: number;
      isCurrent: boolean;
      key: string;
    }
  | {
      type: "ellipsis";
      key: string;
    };

export interface UsePaginationOptions {
  /**
   * The total number of pages.
   */
  count?: ReactiveValue<number>;

  /**
   * The controlled active page number (1-indexed).
   */
  page?: ReactiveValue<number>;

  /**
   * The default active page number when initially rendered (uncontrolled).
   * @default 1
   */
  defaultPage?: number;

  /**
   * Callback invoked when the active page changes.
   */
  onPageChange?: (page: number) => void;

  /**
   * Number of sibling pages to show before and after the active page.
   * @default 1
   */
  siblingCount?: ReactiveValue<number>;

  /**
   * Whether to always show the first page.
   * @default true
   */
  showFirst?: ReactiveValue<boolean>;

  /**
   * Whether to always show the last page.
   * @default true
   */
  showLast?: ReactiveValue<boolean>;

  /**
   * Whether to always show the same number of items (to avoid layout shift).
   * "no-ellipsis" does not count ellipsis as an item.
   * @default false
   */
  fixedItems?: ReactiveValue<boolean | "no-ellipsis">;

  /**
   * Whether the pagination is disabled.
   * @default false
   */
  disabled?: ReactiveValue<boolean>;
}

export interface UsePaginationResult {
  /** Current active page number (1-indexed). */
  page: ObservableValue<number>;

  /** Total number of pages. */
  count: ObservableValue<number>;

  /** Sets the active page number (guarded and clamped between 1 and count). */
  setPage: (page: number) => void;

  /** Navigates to the previous page if available. */
  previous: () => void;

  /** Navigates to the next page if available. */
  next: () => void;

  /** Whether the previous button is disabled (page === 1 or pagination disabled). */
  isPreviousDisabled: DerivedValue<boolean>;

  /** Whether the next button is disabled (page === count or pagination disabled). */
  isNextDisabled: DerivedValue<boolean>;

  /** Whether the entire pagination is disabled. */
  isDisabled: ObservableValue<boolean>;

  /** Reactive list of pagination tokens (pages and ellipses). */
  tokens: DerivedValue<PaginationToken[]>;

  /** Ref to the root container. */
  rootRef: Ref<HTMLElement>;
}

export interface PaginationRootOptions<T extends keyof SeidrElementTagNameMap = "nav"> {
  /** The HTML element tag name to render. @default "nav" */
  as?: T;

  /** Explicit coordinator instance providing reactive state. */
  instance?: UsePaginationResult;

  /** Accessible label for the navigation landmark. @default "Pagination" */
  ariaLabel?: ReactiveValue<string>;

  dataComponent?: string;
  dataPart?: string;
}

export type PaginationRootProps<T extends keyof SeidrElementTagNameMap = "nav"> = PaginationRootOptions<T> &
  SeidrElementProps<T>;

export interface PaginationListOptions<T extends keyof SeidrElementTagNameMap = "ul"> {
  /** The HTML element tag name to render. @default "ul" */
  as?: T;

  /** Explicit coordinator instance providing reactive state. */
  instance?: UsePaginationResult;

  dataComponent?: string;
  dataPart?: string;
}

export type PaginationListProps<T extends keyof SeidrElementTagNameMap = "ul"> = PaginationListOptions<T> &
  SeidrElementProps<T>;

export interface PaginationItemOptions<T extends keyof SeidrElementTagNameMap = "button"> {
  /** The HTML element tag name to render for the button. @default "button" */
  as?: T;

  /** Explicit coordinator instance providing reactive state. */
  instance?: UsePaginationResult;

  /** The 1-indexed page number represented by this item. */
  page: number;

  key?: string;
  dataComponent?: string;
  dataPart?: string;
  onclick?: (e: MouseEvent) => void;
}

export type PaginationItemProps<T extends keyof SeidrElementTagNameMap = "button"> = PaginationItemOptions<T> &
  SeidrElementProps<T>;

export interface PaginationEllipsisOptions<T extends keyof SeidrElementTagNameMap = "span"> {
  /** The HTML element tag name to render for the ellipsis text/symbol. @default "span" */
  as?: T;

  /** Explicit coordinator instance providing reactive state. */
  instance?: UsePaginationResult;

  key?: string;
  dataComponent?: string;
  dataPart?: string;
}

export type PaginationEllipsisProps<T extends keyof SeidrElementTagNameMap = "span"> = PaginationEllipsisOptions<T> &
  SeidrElementProps<T>;

export interface PaginationPreviousOptions<T extends keyof SeidrElementTagNameMap = "button"> {
  /** The HTML element tag name to render. @default "button" */
  as?: T;

  /** Explicit coordinator instance providing reactive state. */
  instance?: UsePaginationResult;

  dataComponent?: string;
  dataPart?: string;
  onclick?: (e: MouseEvent) => void;
}

export type PaginationPreviousProps<T extends keyof SeidrElementTagNameMap = "button"> = PaginationPreviousOptions<T> &
  SeidrElementProps<T>;

export interface PaginationNextOptions<T extends keyof SeidrElementTagNameMap = "button"> {
  /** The HTML element tag name to render. @default "button" */
  as?: T;

  /** Explicit coordinator instance providing reactive state. */
  instance?: UsePaginationResult;

  dataComponent?: string;
  dataPart?: string;
  onclick?: (e: MouseEvent) => void;
}

export type PaginationNextProps<T extends keyof SeidrElementTagNameMap = "button"> = PaginationNextOptions<T> &
  SeidrElementProps<T>;

export interface PaginationItemsProps {
  /** Explicit coordinator instance providing reactive state. */
  instance?: UsePaginationResult;

  /** Props passed to individual page item buttons. */
  itemProps?: Record<string, any>;

  /** Props passed to ellipsis elements. */
  ellipsisProps?: Record<string, any>;
}

export interface PaginationInstance extends UsePaginationResult {
  /** Root `<nav>` container element. */
  Root: <T extends keyof SeidrElementTagNameMap = "nav">(
    props?: PaginationRootProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** `<ul>` list container element. */
  List: <T extends keyof SeidrElementTagNameMap = "ul">(
    props?: PaginationListProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Page item element: `<li><button ...>page</button></li>`. */
  Item: <T extends keyof SeidrElementTagNameMap = "button">(
    props: PaginationItemProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => HTMLLIElement;

  /** Ellipsis element: `<li><span ...>…</span></li>`. */
  Ellipsis: <T extends keyof SeidrElementTagNameMap = "span">(
    props?: PaginationEllipsisProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => HTMLLIElement;

  /** Previous page button: `<li><button ...>Previous</button></li>`. */
  Previous: <T extends keyof SeidrElementTagNameMap = "button">(
    props?: PaginationPreviousProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => HTMLLIElement;

  /** Next page button: `<li><button ...>Next</button></li>`. */
  Next: <T extends keyof SeidrElementTagNameMap = "button">(
    props?: PaginationNextProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => HTMLLIElement;

  /** Automatically renders the calculated page items and ellipses. */
  Items: (props?: PaginationItemsProps) => DerivedValue<SeidrChild[]>;
}

export interface PaginationProps<T extends keyof SeidrElementTagNameMap = "nav"> extends UsePaginationOptions {
  /** The HTML element tag name for the root container. @default "nav" */
  as?: T;

  /** Accessible label for the navigation landmark. @default "Pagination" */
  ariaLabel?: ReactiveValue<string>;

  /** Whether to render previous and next buttons. @default true */
  showControls?: boolean;

  /** Custom previous button label or element. @default "Previous" */
  previousLabel?: SeidrChild | SeidrChild[];

  /** Custom next button label or element. @default "Next" */
  nextLabel?: SeidrChild | SeidrChild[];

  /** Custom ellipsis content. @default "…" */
  ellipsisContent?: SeidrChild | SeidrChild[];

  /** Props passed to Pagination.Root. */
  rootProps?: Record<string, any>;

  /** Props passed to Pagination.List. */
  listProps?: Record<string, any>;

  /** Props passed to page items. */
  itemProps?: Record<string, any>;

  /** Props passed to ellipsis items. */
  ellipsisProps?: Record<string, any>;

  /** Props passed to previous button. */
  previousProps?: Record<string, any>;

  /** Props passed to next button. */
  nextProps?: Record<string, any>;

  /** Custom children to render inside root. If provided, replaces default composition. */
  children?: SeidrChild | SeidrChild[];
}
