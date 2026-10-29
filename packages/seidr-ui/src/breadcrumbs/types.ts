import type {
  EventHandler,
  ObservableValue,
  ReactiveValue,
  SeidrChild,
  SeidrElementProps,
  SeidrElementTagNameMap,
} from "@fimbul-works/seidr";

/**
 * Descriptor for a single breadcrumb item when rendering declaratively.
 */
export interface BreadcrumbItemDescriptor<T extends keyof SeidrElementTagNameMap = "a"> {
  /** The URL or path to navigate to */
  href?: ReactiveValue<string>;
  /** The visible label of the breadcrumb item */
  label: SeidrChild;
  /** Whether this breadcrumb item represents the current page */
  current?: ReactiveValue<boolean>;
  /** Whether the breadcrumb item is disabled */
  disabled?: ReactiveValue<boolean>;
  /** Custom aria-current attribute (defaults to "page" when current) */
  ariaCurrent?: ReactiveValue<string>;
  /** Element tag name */
  as?: T;
  /** Props passed to the wrapper <li> element */
  itemProps?: SeidrElementProps<"li">;
  /** Props passed to the link <a> element */
  linkProps?: SeidrElementProps<T>;
  /** Custom click event handler */
  onclick?: EventHandler<MouseEvent>;
}

/**
 * Configuration options for the Breadcrumbs coordinator.
 */
export interface UseBreadcrumbsOptions {
  /**
   * Visual separator between each breadcrumb item.
   * Used as the default content of Breadcrumbs.Separator.
   * @default "/"
   */
  separator?: ReactiveValue<SeidrChild>;

  /**
   * Accessible label for the navigation container.
   * @default "Breadcrumbs"
   */
  ariaLabel?: ReactiveValue<string>;

  /**
   * Custom ID for the breadcrumbs container.
   */
  id?: string;
}

export interface BreadcrumbsDataSet {
  "data-component": "breadcrumbs";
}

/**
 * Result returned by the headless useBreadcrumbs coordinator hook.
 */
export interface UseBreadcrumbsResult {
  id: string;
  separator: ObservableValue<SeidrChild>;
  ariaLabel: ObservableValue<string>;
  dataset: BreadcrumbsDataSet;
}

export interface BreadcrumbsRootOptions<T extends keyof SeidrElementTagNameMap = "nav"> {
  as?: T;
  ariaLabel?: ReactiveValue<string>;
}

export type BreadcrumbsRootProps<T extends keyof SeidrElementTagNameMap = "nav"> = BreadcrumbsRootOptions<T> &
  Omit<SeidrElementProps<T>, "role" | "ariaLabel"> & {
    instance?: UseBreadcrumbsResult;
    dataComponent?: string;
  };

export interface BreadcrumbsListOptions<T extends keyof SeidrElementTagNameMap = "ol"> {
  as?: T;
}

export type BreadcrumbsListProps<T extends keyof SeidrElementTagNameMap = "ol"> = BreadcrumbsListOptions<T> &
  SeidrElementProps<T> & {
    instance?: UseBreadcrumbsResult;
    dataComponent?: string;
    dataPart?: string;
  };

export interface BreadcrumbsItemOptions<T extends keyof SeidrElementTagNameMap = "li"> {
  as?: T;
}

export type BreadcrumbsItemProps<T extends keyof SeidrElementTagNameMap = "li"> = BreadcrumbsItemOptions<T> &
  SeidrElementProps<T> & {
    instance?: UseBreadcrumbsResult;
    dataComponent?: string;
    dataPart?: string;
  };

export interface BreadcrumbsLinkOptions<T extends keyof SeidrElementTagNameMap = "a"> {
  as?: T;
  href?: ReactiveValue<string>;
  current?: ReactiveValue<boolean>;
  disabled?: ReactiveValue<boolean>;
  ariaCurrent?: ReactiveValue<string>;
  role?: ReactiveValue<string>;
  tabIndex?: ReactiveValue<number>;
}

export type BreadcrumbsLinkProps<T extends keyof SeidrElementTagNameMap = "a"> = BreadcrumbsLinkOptions<T> &
  Omit<SeidrElementProps<T>, "href" | "disabled" | "ariaCurrent" | "role" | "tabIndex"> & {
    instance?: UseBreadcrumbsResult;
    dataComponent?: string;
    dataPart?: string;
  };

export interface BreadcrumbsSeparatorOptions<T extends keyof SeidrElementTagNameMap = "span"> {
  as?: T;
}

export type BreadcrumbsSeparatorProps<T extends keyof SeidrElementTagNameMap = "span"> =
  BreadcrumbsSeparatorOptions<T> &
    SeidrElementProps<T> & {
      instance?: UseBreadcrumbsResult;
      dataComponent?: string;
      dataPart?: string;
    };

/**
 * Fine-grained Breadcrumbs coordinator instance with pre-bound compound element helpers.
 */
export interface BreadcrumbsInstance extends UseBreadcrumbsResult {
  Root: <T extends keyof SeidrElementTagNameMap = "nav">(
    propsOrChildren?: BreadcrumbsRootProps<T> | SeidrChild | SeidrChild[],
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  List: <T extends keyof SeidrElementTagNameMap = "ol">(
    propsOrChildren?: BreadcrumbsListProps<T> | SeidrChild | SeidrChild[],
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  Item: <T extends keyof SeidrElementTagNameMap = "li">(
    propsOrChildren?: BreadcrumbsItemProps<T> | SeidrChild | SeidrChild[],
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  Link: <T extends keyof SeidrElementTagNameMap = "a">(
    propsOrChildren?: BreadcrumbsLinkProps<T> | SeidrChild | SeidrChild[],
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  Separator: <T extends keyof SeidrElementTagNameMap = "span">(
    propsOrChildren?: BreadcrumbsSeparatorProps<T> | SeidrChild | SeidrChild[],
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
}

/**
 * Props for the all-in-one Tier 1 Breadcrumbs component.
 */
export interface BreadcrumbsProps extends UseBreadcrumbsOptions {
  /** Declarative list of breadcrumb items to render. */
  items?: ReactiveValue<BreadcrumbItemDescriptor[]>;
  /** Optional class name for the root <nav> element. */
  className?: ReactiveValue<string>;
  /** Props passed to Root (<nav>). */
  rootProps?: SeidrElementProps<"nav">;
  /** Props passed to List (<ol>). */
  listProps?: SeidrElementProps<"ol">;
}
