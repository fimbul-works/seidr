import type {
  CleanupFunction,
  DerivedValue,
  ObservableValue,
  ReactiveValue,
  SeidrChild,
  SeidrElementProps,
  SeidrElementTagNameMap,
  Value,
} from "@fimbul-works/seidr";

export type TabsOrientation = "horizontal" | "vertical";
export type TabsActivationMode = "automatic" | "manual";

export interface TabsDataSet {
  "data-orientation": TabsOrientation;
  "data-disabled"?: "";
}

export interface UseTabsOptions {
  /** The unique ID for the tabs collection. */
  id?: string;

  /** Controlled value of the currently active tab. */
  value?: ReactiveValue<string>;

  /** Default value of the active tab when uncontrolled. */
  defaultValue?: string;

  /** Event callback fired when the active tab changes. */
  onChange?: (value: string) => void;

  /**
   * The orientation of the tabs.
   * @default "horizontal"
   */
  orientation?: TabsOrientation;

  /**
   * Whether tabs are activated automatically on arrow focus or manually via Enter/Space.
   * @default "automatic"
   */
  activationMode?: TabsActivationMode;

  /** Whether the entire tab collection is disabled. */
  disabled?: ReactiveValue<boolean>;

  /**
   * Whether keyboard arrow navigation wraps around from last to first.
   * @default true
   */
  shouldFocusWrap?: boolean;
}

export interface UseTabsResult {
  /** Root unique ID. */
  id: string;

  /** Read-only derived observable of the currently active tab value. */
  value: DerivedValue<string>;

  /** Reads the active tab value synchronously. */
  selectedValue: () => string;

  /** Updates the active tab value (guarded against disabled states). */
  setSelectedValue: (value: string) => void;

  /** The orientation of the tabs. */
  orientation: TabsOrientation;

  /** The activation mode of the tabs. */
  activationMode: TabsActivationMode;

  /** Whether the tabs are disabled. */
  isDisabled: DerivedValue<boolean>;

  /** Whether keyboard arrow navigation wraps. */
  shouldFocusWrap: boolean;

  /** Checks if a specific tab is active. */
  isSelected: (key: string) => DerivedValue<boolean>;

  /** Focused tab key for roving tabindex tracking. */
  focusedKey: Value<string>;

  /** Generates a deterministic trigger ID. */
  generateTriggerId: (key: string) => string;

  /** Generates a deterministic content panel ID. */
  generateContentId: (key: string) => string;

  /** Registers a trigger element for keyboard navigation and roving tabindex. */
  registerTrigger: (key: string, el: HTMLElement, disabledProp?: boolean | ObservableValue<boolean>) => CleanupFunction;

  /** Currently selected tab DOM element (used by indicator). */
  selectedTabElement: Value<HTMLElement | null>;

  /** Handles key navigation across registered triggers. */
  handleKeyDown: (e: KeyboardEvent, currentKey: string) => void;

  /** Data attribute set for root and subcomponents. */
  dataset: TabsDataSet;
}

export type TabsRootProps<T extends keyof SeidrElementTagNameMap = "div"> = SeidrElementProps<T> & {
  as?: T;
  instance?: UseTabsResult;
};

export type TabsListProps<T extends keyof SeidrElementTagNameMap = "div"> = SeidrElementProps<T> & {
  as?: T;
  instance?: UseTabsResult;
};

export type TabsTriggerProps<T extends keyof SeidrElementTagNameMap = "button"> = SeidrElementProps<T> & {
  as?: T;
  value: string;
  disabled?: boolean | ObservableValue<boolean>;
  instance?: UseTabsResult;
  /**
   * The type attribute when rendered as a button or input.
   * @default "button"
   */
  type?: ReactiveValue<string>;
};

export type TabsContentProps<T extends keyof SeidrElementTagNameMap = "div"> = Omit<
  SeidrElementProps<T>,
  "forceMount"
> & {
  as?: T;
  value: string;
  /** Force mounting the content in DOM regardless of selection (e.g. for CSS transitions). */
  forceMount?: ObservableValue<boolean>;
  tabIndex?: ReactiveValue<number>;
  instance?: UseTabsResult;
};

export type TabsIndicatorProps<T extends keyof SeidrElementTagNameMap = "div"> = SeidrElementProps<T> & {
  as?: T;
  instance?: UseTabsResult;
};

export interface TabsInstance extends UseTabsResult {
  /** Pre-bound Tabs.Root container element. */
  Root: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: Omit<TabsRootProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Pre-bound Tabs.List container element (role="tablist"). */
  List: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: Omit<TabsListProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Pre-bound Tabs.Trigger button element (role="tab"). */
  Trigger: <T extends keyof SeidrElementTagNameMap = "button">(
    props: Omit<TabsTriggerProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Pre-bound Tabs.Content panel element (role="tabpanel"). */
  Content: <T extends keyof SeidrElementTagNameMap = "div">(
    props: Omit<TabsContentProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T] | ObservableValue<SeidrElementTagNameMap[T] | null>;

  /** Pre-bound Tabs.Indicator visual active indicator (role="presentation"). */
  Indicator: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: Omit<TabsIndicatorProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
}

export interface TabsItemDescriptor {
  /** The unique key associating the tab with its content panel. */
  value: string;

  /** Content rendered inside the trigger button. */
  trigger: SeidrChild | SeidrChild[];

  /** Content rendered inside the tab panel. */
  content: SeidrChild | SeidrChild[];

  /** Whether this specific tab is disabled. */
  disabled?: boolean;

  /** Props passed to Tabs.Trigger. */
  triggerProps?: Partial<TabsTriggerProps<any>>;

  /** Props passed to Tabs.Content. */
  contentProps?: Partial<TabsContentProps<any>>;
}

export interface TabsProps<TRoot extends keyof SeidrElementTagNameMap = "div"> extends UseTabsOptions {
  /** HTML element tag name for the root container. */
  as?: TRoot;

  /** Declarative tab item definitions. */
  items?: TabsItemDescriptor[];

  /** Props passed to the Root element. */
  rootProps?: Partial<TabsRootProps<TRoot>>;

  /** Props passed to the List element. */
  listProps?: Partial<TabsListProps<any>>;

  /** Whether to render an active Tabs.Indicator pill. */
  indicator?: boolean | Partial<TabsIndicatorProps<any>>;

  /** Children passed to the Root element (for compound composition). */
  children?: SeidrChild | SeidrChild[];
}
