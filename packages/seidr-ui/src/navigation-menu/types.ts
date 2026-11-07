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
import type {
  MenuArrowProps,
  MenuCheckboxItemData,
  MenuCheckboxItemOptions,
  MenuCheckboxItemProps,
  MenuContentOptions,
  MenuContentProps,
  MenuGroupLabelOptions,
  MenuGroupLabelProps,
  MenuGroupOptions,
  MenuGroupProps,
  MenuIconOptions,
  MenuIconProps,
  MenuItemData,
  MenuItemDescriptionOptions,
  MenuItemDescriptionProps,
  MenuItemDescriptor,
  MenuItemIndicatorOptions,
  MenuItemIndicatorProps,
  MenuItemLabelOptions,
  MenuItemLabelProps,
  MenuItemOptions,
  MenuItemProps,
  MenuItemRegistration,
  MenuInstance,
  MenuLeafDescriptor,
  MenuListRenderOptions,
  MenuRadioGroupData,
  MenuRadioGroupInstance,
  MenuRadioGroupOptions,
  MenuRadioGroupProps,
  MenuRadioItemDescriptor,
  MenuRadioItemOptions,
  MenuRadioItemProps,
  MenuRootOptions,
  MenuRootProps,
  MenuSeparatorOptions,
  MenuSeparatorProps,
  MenuSubContentOptions,
  MenuSubContentProps,
  MenuSubMenuData,
  MenuSubOptions,
  MenuSubProps,
  MenuSubTriggerOptions,
  MenuSubTriggerProps,
  MenuTriggerOptions,
  MenuTriggerProps,
  UseMenuOptions,
  UseMenuRadioGroupOptions,
  UseMenuRadioGroupResult,
  UseMenuResult,
} from "../menu/types.js";
import type { MenubarMenuRegistration, MenubarOrientation } from "../menubar/types.js";
import type { Placement } from "../popper/types.js";

export interface UseNavigationMenuOptions {
  /** Unique identifier for the navigation menu coordinator. */
  id?: string;
  /** Custom data-component attribute prefix. Defaults to "navigation-menu". */
  dataComponent?: string;
  /** Controlled value of the currently open menu, or null when closed. */
  value?: ReactiveValue<string | null>;
  /** Default value of the menu that should be open when initially rendered. */
  defaultValue?: string | null;
  /** Event handler called when the active menu changes. */
  onValueChange?: (value: string | null) => void;
  /** Delay in milliseconds before opening a menu on hover. Defaults to 200ms. */
  delayDuration?: number;
  /** Grace period in milliseconds to switch between triggers or keep the menu open. Defaults to 300ms. */
  skipDelayDuration?: number;
  /** The orientation of the navigation menu. Defaults to "horizontal". */
  orientation?: ReactiveValue<MenubarOrientation>;
  /** When true, keyboard navigation loops from last item to first and vice versa. Defaults to true. */
  loop?: boolean;
}

export interface UseNavigationMenuResult {
  /** Unique identifier for the navigation menu instance. */
  id: string;
  /** Custom data-component prefix. */
  dataComponent: string;
  /** Value of the currently open menu, or null when none are open. */
  value: Value<string | null>;
  /** Value of the trigger that currently holds roving tabindex="0". */
  activeTrigger: Value<string | null>;
  /** Orientation of the navigation menu. */
  orientation: ObservableValue<MenubarOrientation>;
  /** Derived observable indicating whether any menu in the navigation menu is open. */
  isOpen: DerivedValue<boolean>;
  /** Delay in milliseconds before opening a menu on hover. */
  delayDuration: number;
  /** Grace period in milliseconds for switching between menus. */
  skipDelayDuration: number;
  /** Sets the currently open menu. */
  openMenu: (menuValue: string, autoFocusFirst?: boolean) => void;
  /** Closes any open menu. */
  closeMenu: () => void;
  /** Focuses and optionally opens the next menu in sequence. */
  nextMenu: (open?: boolean) => void;
  /** Focuses and optionally opens the previous menu in sequence. */
  prevMenu: (open?: boolean) => void;
  /** Focuses the first menu trigger. */
  firstMenu: () => void;
  /** Focuses the last menu trigger. */
  lastMenu: () => void;
  /** Starts the hover-intent timer to open a menu. */
  startHoverTimer: (menuValue: string) => void;
  /** Starts the leave timer to close the menu after the cursor exits. */
  startLeaveTimer: () => void;
  /** Cancels any active hover or leave timers. */
  cancelTimers: () => void;
  /** Registers a menu into the navigation coordinator. */
  registerMenu: (registration: MenubarMenuRegistration) => () => void;
  /** Keyboard handler attached to the root / list element. */
  handleListKeyDown: (e: KeyboardEvent) => void;
  /** Ref to the root container element. */
  rootRef: Ref<HTMLElement>;
}

export interface NavigationMenuMenuInstance extends Omit<MenuInstance, "Trigger"> {
  /** The unique value identifier for this specific menu. */
  menuValue: string;
  /** Pre-bound trigger helper wired to the navigation menu coordinator. */
  Trigger: <T extends keyof SeidrElementTagNameMap = "button">(
    props?: NavigationMenuTriggerProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
}

export interface NavigationMenuInstance extends UseNavigationMenuResult {
  /** Creates and binds an individual top-level menu inside the navigation menu. */
  createMenu: (
    menuValue: string,
    menuOptions?: Omit<UseMenuOptions, "open" | "onOpenChange">,
  ) => NavigationMenuMenuInstance;

  /** Creates a scoped RadioGroup coordinator inside the currently active menu. */
  createRadioGroup: (
    radioOptions?: UseMenuRadioGroupOptions,
  ) => MenuRadioGroupInstance;

  /** Creates a scoped Submenu coordinator inside the currently active menu. */
  createSub: (
    subOptions?: Omit<UseMenuOptions, "parentMenu">,
  ) => MenuInstance;

  /** NavigationMenu root <nav> container factory. */
  Root: <T extends keyof SeidrElementTagNameMap = "nav">(
    props?: NavigationMenuRootProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** NavigationMenu <ul> list container factory (role="menubar"). */
  List: <T extends keyof SeidrElementTagNameMap = "ul">(
    props?: NavigationMenuListProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Individual menu item container factory. */
  Menu: <T extends keyof SeidrElementTagNameMap = "li">(
    props: NavigationMenuMenuProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Top-level menu trigger button factory. */
  Trigger: <T extends keyof SeidrElementTagNameMap = "button">(
    props?: NavigationMenuTriggerProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Menu floating dropdown content factory. */
  Content: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: NavigationMenuContentProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => DerivedValue<SeidrElementTagNameMap[T] | null>;

  /** Direct navigation link item factory. */
  Link: <T extends keyof SeidrElementTagNameMap = "a">(
    props?: NavigationMenuLinkProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Optional shared viewport container factory. */
  Viewport: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: NavigationMenuViewportProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Selectable menu item element factory. */
  Item: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: NavigationMenuItemProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Checkbox toggle menu item factory. */
  CheckboxItem: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: NavigationMenuCheckboxItemProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Radio group container factory. */
  RadioGroup: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: NavigationMenuRadioGroupProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Radio selection item factory. */
  RadioItem: <T extends keyof SeidrElementTagNameMap = "div">(
    props: NavigationMenuRadioItemProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Submenu container factory. */
  Sub: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: NavigationMenuSubProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Submenu trigger element factory. */
  SubTrigger: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: NavigationMenuSubTriggerProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Submenu floating dropdown content factory. */
  SubContent: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: NavigationMenuSubContentProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => DerivedValue<SeidrElementTagNameMap[T] | null>;

  /** Separator divider factory. */
  Separator: <T extends keyof SeidrElementTagNameMap = "hr">(
    props?: NavigationMenuSeparatorProps<T>,
  ) => SeidrElementTagNameMap[T];

  /** Group container factory. */
  Group: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: NavigationMenuGroupProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Group label factory. */
  GroupLabel: <T extends keyof SeidrElementTagNameMap = "span">(
    props?: NavigationMenuGroupLabelProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Item label factory. */
  ItemLabel: <T extends keyof SeidrElementTagNameMap = "span">(
    props?: NavigationMenuItemLabelProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Item description factory. */
  ItemDescription: <T extends keyof SeidrElementTagNameMap = "span">(
    props?: NavigationMenuItemDescriptionProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Item indicator factory. */
  ItemIndicator: <T extends keyof SeidrElementTagNameMap = "span">(
    props?: NavigationMenuItemIndicatorProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => DerivedValue<SeidrElementTagNameMap[T] | null>;

  /** Icon element factory. */
  Icon: <T extends keyof SeidrElementTagNameMap = "span">(
    props?: NavigationMenuIconProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Arrow element factory. */
  Arrow: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: NavigationMenuArrowProps<T>,
  ) => SeidrElementTagNameMap[T];
}

// ---------------------------------------------------------------------------
// Subcomponent Options & Props
// ---------------------------------------------------------------------------

export interface NavigationMenuRootOptions<T extends keyof SeidrElementTagNameMap = "nav"> {
  as?: T;
  dataComponent?: string;
  instance?: UseNavigationMenuResult;
  children?: SeidrChild | SeidrChild[];
}
export type NavigationMenuRootProps<T extends keyof SeidrElementTagNameMap = "nav"> =
  NavigationMenuRootOptions<T> & SeidrElementProps<T>;

export interface NavigationMenuListOptions<T extends keyof SeidrElementTagNameMap = "ul"> {
  as?: T;
  dataComponent?: string;
  instance?: UseNavigationMenuResult;
  children?: SeidrChild | SeidrChild[];
}
export type NavigationMenuListProps<T extends keyof SeidrElementTagNameMap = "ul"> =
  NavigationMenuListOptions<T> & SeidrElementProps<T>;

export interface NavigationMenuMenuOptions<T extends keyof SeidrElementTagNameMap = "li"> {
  as?: T;
  value: string;
  dataComponent?: string;
  instance?: UseNavigationMenuResult;
  menuInstance?: NavigationMenuMenuInstance;
  children?: SeidrChild | SeidrChild[];
}
export type NavigationMenuMenuProps<T extends keyof SeidrElementTagNameMap = "li"> =
  NavigationMenuMenuOptions<T> & Omit<SeidrElementProps<T>, "value">;

export interface NavigationMenuTriggerOptions<T extends keyof SeidrElementTagNameMap = "button">
  extends MenuTriggerOptions<T> {
  navigationMenuInstance?: UseNavigationMenuResult;
  menuValue?: string;
  children?: SeidrChild | SeidrChild[];
}
export type NavigationMenuTriggerProps<T extends keyof SeidrElementTagNameMap = "button"> =
  NavigationMenuTriggerOptions<T> & SeidrElementProps<T>;

export interface NavigationMenuLinkOptions<T extends keyof SeidrElementTagNameMap = "a"> {
  as?: T;
  dataComponent?: string;
  href?: string;
  target?: string;
  rel?: string;
  value?: ReactiveValue<string>;
  disabled?: boolean | ObservableValue<boolean>;
  ariaDisabled?: boolean | ObservableValue<boolean>;
  navigationMenuInstance?: UseNavigationMenuResult;
  children?: SeidrChild | SeidrChild[];
}
export type NavigationMenuLinkProps<T extends keyof SeidrElementTagNameMap = "a"> =
  NavigationMenuLinkOptions<T> & Omit<SeidrElementProps<T>, "value">;

export interface NavigationMenuViewportOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  as?: T;
  dataComponent?: string;
  instance?: UseNavigationMenuResult;
  children?: SeidrChild | SeidrChild[];
}
export type NavigationMenuViewportProps<T extends keyof SeidrElementTagNameMap = "div"> =
  NavigationMenuViewportOptions<T> & SeidrElementProps<T>;

export type NavigationMenuContentOptions<T extends keyof SeidrElementTagNameMap = "div"> = MenuContentOptions<T>;
export type NavigationMenuContentProps<T extends keyof SeidrElementTagNameMap = "div"> = MenuContentProps<T>;

export type NavigationMenuItemOptions<T extends keyof SeidrElementTagNameMap = "div"> = MenuItemOptions<T>;
export type NavigationMenuItemProps<T extends keyof SeidrElementTagNameMap = "div"> = MenuItemProps<T>;

export type NavigationMenuCheckboxItemOptions<T extends keyof SeidrElementTagNameMap = "div"> =
  MenuCheckboxItemOptions<T>;
export type NavigationMenuCheckboxItemProps<T extends keyof SeidrElementTagNameMap = "div"> =
  MenuCheckboxItemProps<T>;

export type NavigationMenuRadioGroupOptions<T extends keyof SeidrElementTagNameMap = "div"> =
  MenuRadioGroupOptions<T>;
export type NavigationMenuRadioGroupProps<T extends keyof SeidrElementTagNameMap = "div"> =
  MenuRadioGroupProps<T>;

export type NavigationMenuRadioItemOptions<T extends keyof SeidrElementTagNameMap = "div"> = MenuRadioItemOptions<T>;
export type NavigationMenuRadioItemProps<T extends keyof SeidrElementTagNameMap = "div"> = MenuRadioItemProps<T>;

export type NavigationMenuSubOptions<T extends keyof SeidrElementTagNameMap = "div"> = MenuSubOptions<T>;
export type NavigationMenuSubProps<T extends keyof SeidrElementTagNameMap = "div"> = MenuSubProps<T>;

export type NavigationMenuSubTriggerOptions<T extends keyof SeidrElementTagNameMap = "div"> =
  MenuSubTriggerOptions<T>;
export type NavigationMenuSubTriggerProps<T extends keyof SeidrElementTagNameMap = "div"> =
  MenuSubTriggerProps<T>;

export type NavigationMenuSubContentOptions<T extends keyof SeidrElementTagNameMap = "div"> =
  MenuSubContentOptions<T>;
export type NavigationMenuSubContentProps<T extends keyof SeidrElementTagNameMap = "div"> =
  MenuSubContentProps<T>;

export type NavigationMenuSeparatorOptions<T extends keyof SeidrElementTagNameMap = "hr"> = MenuSeparatorOptions<T>;
export type NavigationMenuSeparatorProps<T extends keyof SeidrElementTagNameMap = "hr"> = MenuSeparatorProps<T>;

export type NavigationMenuGroupOptions<T extends keyof SeidrElementTagNameMap = "div"> = MenuGroupOptions<T>;
export type NavigationMenuGroupProps<T extends keyof SeidrElementTagNameMap = "div"> = MenuGroupProps<T>;

export type NavigationMenuGroupLabelOptions<T extends keyof SeidrElementTagNameMap = "span"> =
  MenuGroupLabelOptions<T>;
export type NavigationMenuGroupLabelProps<T extends keyof SeidrElementTagNameMap = "span"> =
  MenuGroupLabelProps<T>;

export type NavigationMenuItemLabelOptions<T extends keyof SeidrElementTagNameMap = "span"> =
  MenuItemLabelOptions<T>;
export type NavigationMenuItemLabelProps<T extends keyof SeidrElementTagNameMap = "span"> =
  MenuItemLabelProps<T>;

export type NavigationMenuItemDescriptionOptions<T extends keyof SeidrElementTagNameMap = "span"> =
  MenuItemDescriptionOptions<T>;
export type NavigationMenuItemDescriptionProps<T extends keyof SeidrElementTagNameMap = "span"> =
  MenuItemDescriptionProps<T>;

export type NavigationMenuItemIndicatorOptions<T extends keyof SeidrElementTagNameMap = "span"> =
  MenuItemIndicatorOptions<T>;
export type NavigationMenuItemIndicatorProps<T extends keyof SeidrElementTagNameMap = "span"> =
  MenuItemIndicatorProps<T>;

export type NavigationMenuIconOptions<T extends keyof SeidrElementTagNameMap = "span"> = MenuIconOptions<T>;
export type NavigationMenuIconProps<T extends keyof SeidrElementTagNameMap = "span"> = MenuIconProps<T>;

export type NavigationMenuArrowProps<T extends keyof SeidrElementTagNameMap = "div"> = MenuArrowProps<T>;

/**
 * High-level declarative descriptor for each item in Tier 1 `NavigationMenu`.
 */
export interface NavigationMenuItemDescriptor {
  /** Unique identifier for the item. Required for dropdown menus. */
  value?: string;
  /** Display label or trigger content. */
  trigger: SeidrChild | SeidrChild[];
  /** When provided, renders as a direct navigation link instead of a dropdown menu. */
  href?: string;
  /** Link target attribute (e.g. "_blank"). */
  target?: string;
  /** Link rel attribute. */
  rel?: string;
  /** Child menu items rendered inside the dropdown panel. */
  items?: ReactiveValue<MenuItemDescriptor[]>;
  /** Optional custom child elements rendered inside the dropdown panel. */
  children?: SeidrChild | SeidrChild[];
  /** Whether this entire menu or link is disabled. */
  disabled?: boolean | ObservableValue<boolean>;
  /** Custom element props forwarded to the menu container element. */
  menuProps?: Partial<NavigationMenuMenuProps>;
  /** Custom element props forwarded to the trigger button element. */
  triggerProps?: Partial<NavigationMenuTriggerProps>;
  /** Custom element props forwarded to the link element (for direct links). */
  linkProps?: Partial<NavigationMenuLinkProps>;
  /** Custom element props forwarded to the content dropdown element. */
  contentProps?: Partial<NavigationMenuContentProps>;
}

/**
 * High-level unified props for Tier 1 NavigationMenu component.
 */
export interface NavigationMenuProps<T extends keyof SeidrElementTagNameMap = "nav">
  extends UseNavigationMenuOptions {
  /** Underlying HTML tag for root container element. Defaults to "nav". */
  as?: T;
  /** Declarative list of navigation items / menus. */
  items?: ReactiveValue<NavigationMenuItemDescriptor[]>;
  /** Direct children when composing manually. */
  children?: SeidrChild | SeidrChild[];
}
