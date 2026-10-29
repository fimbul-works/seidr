import type {
  DerivedValue,
  ObservableValue,
  ReactiveValue,
  SeidrChild,
  SeidrElementProps,
  SeidrElementTagNameMap,
  Value,
} from "@fimbul-works/seidr";

export type ToggleGroupOrientation = "horizontal" | "vertical";

export interface ToggleGroupItemData {
  /** Unique string value identifying this item. */
  value: string;
  /** Display label or child content. */
  label?: SeidrChild | SeidrChild[];
  /** Whether this individual item is disabled. */
  disabled?: boolean | ObservableValue<boolean>;
  /** Optional custom props forwarded to the item element. */
  props?: Omit<ToggleGroupItemProps<"button">, "instance" | "value">;
}

export interface ToggleGroupSingleOptions {
  /** Whether multiple selection is enabled. */
  multiple?: false;
  /** Controlled selected value. */
  value?: ReactiveValue<string | null>;
  /** Default selected value when initially rendered (uncontrolled). */
  defaultValue?: string | null;
  /** Event handler called when the selected value changes. */
  onChange?: (value: string | null) => void;
}

export interface ToggleGroupMultipleOptions {
  /** Whether multiple selection is enabled. */
  multiple: true;
  /** Controlled selected values array. */
  value?: ReactiveValue<string[]>;
  /** Default selected values array when initially rendered (uncontrolled). */
  defaultValue?: string[];
  /** Event handler called when the selected values change. */
  onChange?: (value: string[]) => void;
}

export type UseToggleGroupOptions = (ToggleGroupSingleOptions | ToggleGroupMultipleOptions) & {
  /** Unique ID for the toggle group container. */
  id?: string;
  /** Visual and navigation axis: "horizontal" | "vertical". Defaults to "horizontal". */
  orientation?: ToggleGroupOrientation;
  /** Whether the entire toggle group is disabled. */
  disabled?: ReactiveValue<boolean>;
  /** Whether empty selection is disallowed. Defaults to false (clicking active item deselects it). */
  disallowEmptySelection?: boolean;
  /** Whether roving arrow-key navigation loops around boundaries. Defaults to true. */
  loop?: boolean;
};

export interface UseToggleGroupResult {
  /** Unique ID of the toggle group. */
  id: string;
  /** Group orientation: "horizontal" | "vertical". */
  orientation: ToggleGroupOrientation;
  /** Whether multiple selection is allowed. */
  multiple: boolean;
  /** Read-only derived observable of group disabled state. */
  isDisabled: DerivedValue<boolean>;
  /** Read-only derived observable of the current selected value(s). */
  value: DerivedValue<string | null | string[]>;
  /** Returns a derived observable boolean indicating whether an item key is currently pressed/selected. */
  isSelected: (value: string) => DerivedValue<boolean>;
  /** Returns a derived observable tabIndex (0, -1, or undefined) for roving focus. */
  getItemTabIndex: (value: string, isItemDisabled: () => boolean) => DerivedValue<number | undefined>;
  /** Toggles the selected state of an item. */
  toggle: (value: string) => void;
  /** The currently focused item key for roving tabIndex. */
  focusedKey: Value<string | null>;
  /** Handles keyboard events for roving navigation on an item. */
  handleItemKeyDown: (e: KeyboardEvent, value: string) => void;
  /** Registers a DOM item for layout-aware roving focus navigation. Returns cleanup function. */
  registerItem: (value: string, el: HTMLElement, isItemDisabled: () => boolean) => () => void;
}

export type ToggleGroupInstance = UseToggleGroupResult & {
  /** Pre-bound ToggleGroup.Root element (role="group"). */
  Root: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: Omit<ToggleGroupRootProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  /** Pre-bound ToggleGroup.Item toggle button element. */
  Item: <T extends keyof SeidrElementTagNameMap = "button">(
    props: Omit<ToggleGroupItemProps<T>, "instance"> & { value: string },
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
};

export interface ToggleGroupSubcomponentProps {
  /** Internal coordinator instance. */
  instance?: UseToggleGroupResult;
  /** Semantic component identifier for CSS styling. */
  dataComponent?: string;
}

export type ToggleGroupRootProps<T extends keyof SeidrElementTagNameMap = "div"> = SeidrElementProps<T> &
  ToggleGroupSubcomponentProps & {
    as?: T;
  };

export type ToggleGroupItemProps<T extends keyof SeidrElementTagNameMap = "button"> = SeidrElementProps<T> &
  ToggleGroupSubcomponentProps & {
    as?: T;
    value: string;
    type?: string;
    disabled?: boolean | ObservableValue<boolean>;
  };

export type ToggleGroupProps<T extends keyof SeidrElementTagNameMap = "button"> = UseToggleGroupOptions & {
  /** Polymorphic tag name for the root element. Defaults to "div". */
  as?: T;
  /** Declarative array of item descriptions. */
  items?: ToggleGroupItemData[];
  /** Props passed directly to ToggleGroup.Root. */
  rootProps?: Omit<ToggleGroupRootProps<T>, "instance">;
  /** Children elements rendered inside ToggleGroup.Root. */
  children?: SeidrChild | SeidrChild[];
};
