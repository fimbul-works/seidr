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
import type { AnchorRect, Placement } from "../popper/types.js";
import type { UsePopperResult } from "../popper/types.js";

export type MenuOrientation = "horizontal" | "vertical";

export interface MenuItemRegistration {
  value: string;
  getElement: () => HTMLElement | null;
  isDisabled: () => boolean;
  getTextValue: () => string;
  select?: () => void;
  openSubmenu?: () => void;
  isSubmenuTrigger?: boolean;
}

export interface MenuItemData {
  type?: "item";
  /** Unique identifier for the menu item. */
  value: string;
  /** Display label or child content. */
  label?: SeidrChild | SeidrChild[];
  /** Optional secondary description text or elements. */
  description?: SeidrChild | SeidrChild[];
  /** Optional icon or leading element. */
  icon?: SeidrChild | SeidrChild[];
  /** Optional trailing content or child elements. */
  children?: SeidrChild | SeidrChild[];
  /** Whether this individual item is disabled. */
  disabled?: boolean | ObservableValue<boolean>;
  /** Optional text representation for typeahead searches. */
  textValue?: string;
  /** Whether the menu closes upon selecting this item. Defaults to true. */
  closeOnSelect?: boolean;
  /** Callback fired when the item is activated. */
  onSelect?: () => void;
  /** Custom element props forwarded to the item element. */
  props?: Record<string, any>;
}

export interface MenuCheckboxItemData {
  type: "checkbox";
  /** Unique identifier for the checkbox item. */
  value: string;
  /** Display label or child content. */
  label?: SeidrChild | SeidrChild[];
  /** Optional secondary description. */
  description?: SeidrChild | SeidrChild[];
  /** Controlled or uncontrolled checked state. */
  checked?: ReactiveValue<boolean | "mixed">;
  /** Default checked state. */
  defaultChecked?: boolean | "mixed";
  /** Callback fired when the checked state changes. */
  onChange?: (checked: boolean) => void;
  /** Whether this individual item is disabled. */
  disabled?: boolean | ObservableValue<boolean>;
  /** Whether the menu closes upon toggling this item. Defaults to false. */
  closeOnSelect?: boolean;
  /** Custom indicator element (e.g. checkmark). */
  indicator?: SeidrChild | SeidrChild[];
  /** Optional trailing content or child elements. */
  children?: SeidrChild | SeidrChild[];
  /** Callback fired when the item is activated. */
  onSelect?: () => void;
  /** Custom element props forwarded to the item element. */
  props?: Record<string, any>;
}

export interface MenuRadioItemDescriptor {
  /** Unique string value for this radio option. */
  value: string;
  /** Display label or child content. */
  label?: SeidrChild | SeidrChild[];
  /** Optional secondary description. */
  description?: SeidrChild | SeidrChild[];
  /** Whether this option is disabled. */
  disabled?: boolean | ObservableValue<boolean>;
  /** Custom indicator element (e.g. dot or checkmark). */
  indicator?: SeidrChild | SeidrChild[];
  /** Optional trailing content or child elements. */
  children?: SeidrChild | SeidrChild[];
  /** Custom element props forwarded to the radio item element. */
  props?: Record<string, any>;
}

export interface MenuRadioGroupData {
  type: "radio-group";
  /** Unique identifier for the radio group. */
  value?: ReactiveValue<string>;
  /** Default selected value when initially rendered. */
  defaultValue?: string;
  /** Callback fired when the selected value changes. */
  onChange?: (value: string) => void;
  /** Whether the entire radio group is disabled. */
  disabled?: boolean | ObservableValue<boolean>;
  /** Optional accessible group label. */
  label?: SeidrChild | SeidrChild[];
  /** Child radio items. */
  items: MenuRadioItemDescriptor[];
}

export type MenuLeafDescriptor =
  | MenuItemData
  | MenuCheckboxItemData
  | MenuSeparatorData;

export interface MenuSubMenuData {
  type: "sub";
  /** Unique identifier for the submenu. */
  value: string;
  /** Display label or trigger content. */
  label?: SeidrChild | SeidrChild[];
  /** Whether this submenu trigger is disabled. */
  disabled?: boolean | ObservableValue<boolean>;
  /** Child menu items rendered inside the submenu content. */
  items: MenuLeafDescriptor[];
}

export interface MenuSeparatorData {
  type: "separator";
}

export interface MenuGroupData {
  type: "group";
  /** Optional accessible group label. */
  label?: SeidrChild | SeidrChild[];
  /** Child menu items inside this group. */
  items: MenuLeafDescriptor[];
}

export type MenuItemDescriptor =
  | MenuItemData
  | MenuCheckboxItemData
  | MenuRadioGroupData
  | MenuSubMenuData
  | MenuSeparatorData
  | MenuGroupData;

export interface UseMenuOptions {
  /** Unique ID for the menu system. */
  id?: string;
  /** Custom data-component attribute prefix. Defaults to "menu". */
  dataComponent?: string;
  /** Controlled open state. */
  open?: ReactiveValue<boolean>;
  /** Default open state when initially rendered. */
  defaultOpen?: boolean;
  /** Event handler called when the open state changes. */
  onOpenChange?: (isOpen: boolean) => void;
  /** Floating placement for the menu content dropdown. Defaults to "bottom-start". */
  placement?: Placement;
  /** Whether the menu should be modal (closing on outside interaction and trapping focus). Defaults to true. */
  modal?: boolean;
  /** Whether the scroll should be prevented when open. Defaults to false. */
  preventScroll?: boolean;
  /** Force mounting the content in the DOM tree regardless of open state. */
  forceMount?: boolean;
  /** Whether keyboard navigation loops around boundaries. Defaults to true. */
  loop?: boolean;
  /** Whether an item closes the root menu on activation by default. Defaults to true. */
  closeOnSelect?: boolean;
  /** Reference to parent menu if this instance is a submenu. */
  parentMenu?: UseMenuResult | null;
  /** Custom function to determine virtual anchor boundaries for popper positioning. */
  getAnchorRect?: (anchor?: HTMLElement) => AnchorRect | undefined;
  /** Optional target element to portal the menu content into (e.g. `getDocument().body`). */
  portalTarget?: HTMLElement;
}

export interface UseMenuResult {
  /** Unique ID of the menu. */
  id: string;
  /** Generated unique ID for the trigger element. */
  triggerId: DerivedValue<string>;
  /** Generated unique ID for the content element. */
  contentId: DerivedValue<string>;
  /** Reactive boolean indicating if the menu is open. */
  isOpen: DerivedValue<boolean>;
  /** Opens the menu. */
  open: () => void;
  /** Closes the menu. If recursively is true, also closes all ancestor parent menus. */
  close: (recursively?: boolean) => void;
  /** Toggles the open state of the menu. */
  toggle: () => void;
  /** Ref to the trigger activator element. */
  triggerRef: Ref<HTMLElement>;
  /** Ref to the content dropdown element. */
  contentRef: Ref<HTMLElement>;
  /** Popper positioning coordinator instance. */
  popper: UsePopperResult;
  /** Currently highlighted item key or null. */
  highlightedValue: Value<string | null>;
  /** Highlights a specific item key. */
  highlightItem: (val: string | null) => void;
  /** Registers a menu item with the coordinator for focus, keyboard, and typeahead tracking. */
  registerItem: (data: MenuItemRegistration) => () => void;
  /** Registers a child submenu instance. */
  registerSubmenu: (child: UseMenuResult) => () => void;
  /** Event handler for trigger clicks. */
  handleTriggerClick: (e: MouseEvent) => void;
  /** Event handler for trigger keydown events. */
  handleTriggerKeyDown: (e: KeyboardEvent) => void;
  /** Event handler for content container keydown events. */
  handleContentKeyDown: (e: KeyboardEvent) => void;
  /** Whether this menu instance is modal. */
  modal: boolean;
  /** Whether forceMount is active. */
  forceMount: boolean;
  /** Optional target element to portal the menu content into. */
  portalTarget?: HTMLElement;
  /** Checks whether a DOM node is inside this menu's trigger, content, or any nested submenu. */
  containsNode: (target: Node) => boolean;
  /** Whether keyboard loop navigation is active. */
  loop: boolean;
  /** Parent menu instance if this is a submenu. */
  parentMenu: UseMenuResult | null;
  /** Root-most menu instance in this menu tree hierarchy. */
  rootMenu: UseMenuResult;
}

export interface UseMenuRadioGroupOptions {
  /** Controlled selected value. */
  value?: ReactiveValue<string>;
  /** Default selected value when initially rendered (uncontrolled). */
  defaultValue?: string;
  /** Event handler called when the selected value changes. */
  onChange?: (value: string) => void;
  /** Whether the entire radio group is disabled. */
  disabled?: boolean | ObservableValue<boolean>;
}

export interface UseMenuRadioGroupResult {
  /** Derived observable of the currently selected string value. */
  value: DerivedValue<string>;
  /** Sets the currently selected value. */
  setSelectedValue: (val: string) => void;
  /** Returns a derived observable boolean indicating if the given value is selected. */
  isSelected: (val: string) => DerivedValue<boolean>;
  /** Whether the radio group is disabled. */
  isDisabled: DerivedValue<boolean>;
}

export interface MenuRadioGroupInstance extends UseMenuRadioGroupResult {
  Root: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: MenuRadioGroupProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  Item: <T extends keyof SeidrElementTagNameMap = "div">(
    props: MenuRadioItemProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
}

// ---------------------------------------------------------------------------
// Subcomponent Options & Props
// ---------------------------------------------------------------------------

export interface MenuRootOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  as?: T;
  dataComponent?: string;
  instance?: UseMenuResult;
}
export type MenuRootProps<T extends keyof SeidrElementTagNameMap = "div"> = MenuRootOptions<T> &
  SeidrElementProps<T>;

export interface MenuTriggerOptions<T extends keyof SeidrElementTagNameMap = "button"> {
  as?: T;
  type?: "button" | "submit" | "reset";
  dataComponent?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  instance?: UseMenuResult;
}
export type MenuTriggerProps<T extends keyof SeidrElementTagNameMap = "button"> = MenuTriggerOptions<T> &
  SeidrElementProps<T>;

export interface MenuContentOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  as?: T;
  dataComponent?: string;
  /** Optional dynamic items rendered inside this content via menu.List. */
  items?: ReactiveValue<MenuItemDescriptor[]>;
  /** Internal render helper for dynamic items list. */
  renderList?: (items: ReactiveValue<MenuItemDescriptor[]>) => SeidrChild;
  /** Optional target element to portal the content into. Overrides `instance.portalTarget`. */
  portalTarget?: HTMLElement;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  instance?: UseMenuResult;
}
export type MenuContentProps<T extends keyof SeidrElementTagNameMap = "div"> = MenuContentOptions<T> &
  SeidrElementProps<T>;

export interface MenuPortalProps {
  /** Target element to portal into. Defaults to `instance.portalTarget ?? getDocument().body`. */
  target?: HTMLElement;
  instance?: UseMenuResult;
  subInstance?: UseMenuResult;
}

export interface MenuItemOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  as?: T;
  dataComponent?: string;
  value?: string;
  disabled?: boolean | ObservableValue<boolean>;
  textValue?: string;
  closeOnSelect?: boolean;
  onSelect?: () => void;
  children?: SeidrChild | SeidrChild[];
  instance?: UseMenuResult;
}
export type MenuItemProps<T extends keyof SeidrElementTagNameMap = "div"> = MenuItemOptions<T> &
  SeidrElementProps<T>;

export interface MenuCheckboxItemOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  as?: T;
  dataComponent?: string;
  value?: string;
  checked?: ReactiveValue<boolean | "mixed">;
  defaultChecked?: boolean | "mixed";
  onChange?: (checked: boolean) => void;
  disabled?: boolean | ObservableValue<boolean>;
  closeOnSelect?: boolean;
  onSelect?: () => void;
  children?: SeidrChild | SeidrChild[];
  instance?: UseMenuResult;
}
export type MenuCheckboxItemProps<T extends keyof SeidrElementTagNameMap = "div"> = MenuCheckboxItemOptions<T> &
  SeidrElementProps<T>;

export interface MenuRadioGroupOptions<T extends keyof SeidrElementTagNameMap = "div">
  extends UseMenuRadioGroupOptions {
  as?: T;
  dataComponent?: string;
  instance?: UseMenuResult;
  radioGroupInstance?: UseMenuRadioGroupResult;
}
export type MenuRadioGroupProps<T extends keyof SeidrElementTagNameMap = "div"> = MenuRadioGroupOptions<T> &
  SeidrElementProps<T>;

export interface MenuRadioItemOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  as?: T;
  dataComponent?: string;
  value: string;
  disabled?: boolean | ObservableValue<boolean>;
  closeOnSelect?: boolean;
  onSelect?: () => void;
  children?: SeidrChild | SeidrChild[];
  instance?: UseMenuResult;
  radioGroupInstance?: UseMenuRadioGroupResult;
}
export type MenuRadioItemProps<T extends keyof SeidrElementTagNameMap = "div"> = MenuRadioItemOptions<T> &
  SeidrElementProps<T>;

export interface MenuSubOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  as?: T;
  dataComponent?: string;
  instance?: UseMenuResult;
  subInstance?: UseMenuResult;
}
export type MenuSubProps<T extends keyof SeidrElementTagNameMap = "div"> = MenuSubOptions<T> &
  SeidrElementProps<T>;

export interface MenuSubTriggerOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  as?: T;
  dataComponent?: string;
  value?: string;
  disabled?: boolean | ObservableValue<boolean>;
  textValue?: string;
  children?: SeidrChild | SeidrChild[];
  instance?: UseMenuResult;
  subInstance?: UseMenuResult;
}
export type MenuSubTriggerProps<T extends keyof SeidrElementTagNameMap = "div"> = MenuSubTriggerOptions<T> &
  SeidrElementProps<T>;

export interface MenuSubContentOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  as?: T;
  dataComponent?: string;
  /** Optional target element to portal the submenu content into. Overrides `subInstance.portalTarget`. */
  portalTarget?: HTMLElement;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  instance?: UseMenuResult;
  subInstance?: UseMenuResult;
}
export type MenuSubContentProps<T extends keyof SeidrElementTagNameMap = "div"> = MenuSubContentOptions<T> &
  SeidrElementProps<T>;

export interface MenuSeparatorOptions<T extends keyof SeidrElementTagNameMap = "hr"> {
  as?: T;
  dataComponent?: string;
  instance?: UseMenuResult;
}
export type MenuSeparatorProps<T extends keyof SeidrElementTagNameMap = "hr"> = MenuSeparatorOptions<T> &
  SeidrElementProps<T>;

export interface MenuGroupOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  as?: T;
  dataComponent?: string;
  instance?: UseMenuResult;
}
export type MenuGroupProps<T extends keyof SeidrElementTagNameMap = "div"> = MenuGroupOptions<T> &
  SeidrElementProps<T>;

export interface MenuGroupLabelOptions<T extends keyof SeidrElementTagNameMap = "span"> {
  as?: T;
  dataComponent?: string;
  instance?: UseMenuResult;
}
export type MenuGroupLabelProps<T extends keyof SeidrElementTagNameMap = "span"> = MenuGroupLabelOptions<T> &
  SeidrElementProps<T>;

export interface MenuItemLabelOptions<T extends keyof SeidrElementTagNameMap = "span"> {
  as?: T;
  dataComponent?: string;
  instance?: UseMenuResult;
}
export type MenuItemLabelProps<T extends keyof SeidrElementTagNameMap = "span"> = MenuItemLabelOptions<T> &
  SeidrElementProps<T>;

export interface MenuItemDescriptionOptions<T extends keyof SeidrElementTagNameMap = "span"> {
  as?: T;
  dataComponent?: string;
  instance?: UseMenuResult;
}
export type MenuItemDescriptionProps<T extends keyof SeidrElementTagNameMap = "span"> =
  MenuItemDescriptionOptions<T> & SeidrElementProps<T>;

export interface MenuItemIndicatorOptions<T extends keyof SeidrElementTagNameMap = "span"> {
  as?: T;
  dataComponent?: string;
  forceMount?: boolean;
  checked?: ObservableValue<boolean | "mixed">;
  instance?: UseMenuResult;
}
export type MenuItemIndicatorProps<T extends keyof SeidrElementTagNameMap = "span"> =
  MenuItemIndicatorOptions<T> & SeidrElementProps<T>;

export interface MenuIconOptions<T extends keyof SeidrElementTagNameMap = "span"> {
  as?: T;
  dataComponent?: string;
  instance?: UseMenuResult;
}
export type MenuIconProps<T extends keyof SeidrElementTagNameMap = "span"> = MenuIconOptions<T> &
  SeidrElementProps<T>;

export interface MenuArrowOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  as?: T;
  dataComponent?: string;
  size?: number;
  instance?: UseMenuResult;
}
export type MenuArrowProps<T extends keyof SeidrElementTagNameMap = "div"> = MenuArrowOptions<T> &
  SeidrElementProps<T>;

export interface MenuListRenderOptions {
  renderItem?: (
    itemVal: Value<MenuItemDescriptor>,
    key: string,
    instance: MenuInstance,
  ) => SeidrChild;
  itemProps?: Partial<MenuItemOptions<"div">> & Partial<SeidrElementProps<"div">>;
}

// ---------------------------------------------------------------------------
// Coordinator & All-In-One Interfaces
// ---------------------------------------------------------------------------

export interface MenuInstance extends UseMenuResult {
  Root: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: MenuRootProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  Trigger: <T extends keyof SeidrElementTagNameMap = "button">(
    props?: MenuTriggerProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  Portal: (props?: MenuPortalProps, children?: SeidrChild | SeidrChild[]) => SeidrChild;
  Content: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: MenuContentProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => DerivedValue<SeidrElementTagNameMap[T] | null>;
  Item: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: MenuItemProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  CheckboxItem: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: MenuCheckboxItemProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  RadioGroup: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: MenuRadioGroupProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  RadioItem: <T extends keyof SeidrElementTagNameMap = "div">(
    props: MenuRadioItemProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  createRadioGroup: (options?: UseMenuRadioGroupOptions) => MenuRadioGroupInstance;
  createSub: (options?: Omit<UseMenuOptions, "parentMenu">) => MenuInstance;
  Sub: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: MenuSubProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  SubTrigger: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: MenuSubTriggerProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  SubContent: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: MenuSubContentProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => DerivedValue<SeidrElementTagNameMap[T] | null>;
  Separator: <T extends keyof SeidrElementTagNameMap = "hr">(
    props?: MenuSeparatorProps<T>,
  ) => SeidrElementTagNameMap[T];
  Group: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: MenuGroupProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  GroupLabel: <T extends keyof SeidrElementTagNameMap = "span">(
    props?: MenuGroupLabelProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  ItemLabel: <T extends keyof SeidrElementTagNameMap = "span">(
    props?: MenuItemLabelProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  ItemDescription: <T extends keyof SeidrElementTagNameMap = "span">(
    props?: MenuItemDescriptionProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  ItemIndicator: <T extends keyof SeidrElementTagNameMap = "span">(
    props?: MenuItemIndicatorProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => DerivedValue<SeidrElementTagNameMap[T] | null>;
  Icon: <T extends keyof SeidrElementTagNameMap = "span">(
    props?: MenuIconProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  Arrow: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: MenuArrowProps<T>,
  ) => SeidrElementTagNameMap[T];
  List: (
    items: ReactiveValue<MenuItemDescriptor[]>,
    options?: MenuListRenderOptions,
  ) => SeidrChild;
}

export interface MenuOptions<T extends keyof SeidrElementTagNameMap = "div"> extends UseMenuOptions {
  /** Polymorphic tag name for the root element. Defaults to "div". */
  as?: T;
  /** Trigger content or element. */
  trigger?: SeidrChild | SeidrChild[];
  /** Declarative array or reactive observable of menu item descriptors. */
  items?: ReactiveValue<MenuItemDescriptor[]>;
  /** Props passed to Menu.Root. */
  rootProps?: MenuRootOptions<T> & SeidrElementProps<T>;
  /** Props passed to Menu.Trigger. */
  triggerProps?: MenuTriggerOptions<"button"> & SeidrElementProps<"button">;
  /** Props passed to Menu.Content. */
  contentProps?: MenuContentOptions<"div"> & SeidrElementProps<"div">;
  /** Children elements rendered directly inside Menu.Content or Root. */
  children?: SeidrChild | SeidrChild[];
}

export type MenuProps<T extends keyof SeidrElementTagNameMap = "div"> = MenuOptions<T>;
