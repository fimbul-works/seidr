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
  MenuPortalProps,
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
import type { Placement } from "../popper/types.js";

export type MenubarOrientation = "horizontal" | "vertical";

export interface MenubarMenuRegistration {
  value: string;
  getTriggerElement: () => HTMLElement | null;
  getContentElement?: () => HTMLElement | null;
  containsTarget?: (target: Node) => boolean;
  open: (autoFocusFirst?: boolean) => void;
  close: () => void;
  focusTrigger: () => void;
  isDisabled: () => boolean;
}

export interface UseMenubarOptions {
  /** Unique identifier for the menubar coordinator. */
  id?: string;
  /** Custom data-component attribute prefix. Defaults to "menubar". */
  dataComponent?: string;
  /** Controlled value of the currently open menu, or null when closed. */
  value?: ReactiveValue<string | null>;
  /** Default value of the menu that should be open when initially rendered. */
  defaultValue?: string | null;
  /** Event handler called when the active menu changes. */
  onValueChange?: (value: string | null) => void;
  /** When true, keyboard navigation loops from last item to first and vice versa. Defaults to true. */
  loop?: boolean;
  /** The orientation of the menubar. Defaults to "horizontal". */
  orientation?: MenubarOrientation;
  /** When true, Alt key by itself focuses this menubar. Defaults to false. */
  focusOnAlt?: boolean;
  /** Optional target element to portal the menu dropdowns into (e.g. `getDocument().body`). */
  portalTarget?: HTMLElement;
}

export interface UseMenubarResult {
  /** Unique identifier for the menubar instance. */
  id: string;
  /** Custom data-component prefix. */
  dataComponent: string;
  /** Value of the currently open menu, or null when none are open. */
  value: Value<string | null>;
  /** Value of the trigger that currently holds roving tabindex="0". */
  activeTrigger: Value<string | null>;
  /** Orientation of the menubar. */
  orientation: MenubarOrientation;
  /** Optional target element to portal the menu dropdowns into. */
  portalTarget?: HTMLElement;
  /** Derived observable indicating whether any menu in the menubar is open. */
  isOpen: DerivedValue<boolean>;
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
  /** Registers a menu into the menubar coordinator. */
  registerMenu: (registration: MenubarMenuRegistration) => () => void;
  /** Keyboard handler attached to the MenubarRoot element. */
  handleRootKeyDown: (e: KeyboardEvent) => void;
  /** Ref to the root container element. */
  rootRef: Ref<HTMLElement>;
}

export interface MenubarMenuInstance extends MenuInstance {
  /** The unique value identifier for this specific menu. */
  menuValue: string;
  /** Pre-bound trigger helper wired to the parent menubar coordinator. */
  Trigger: <T extends keyof SeidrElementTagNameMap = "button">(
    props?: MenubarTriggerProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
}

export interface MenubarInstance extends UseMenubarResult {
  /** Creates and binds an individual top-level menu inside the menubar. */
  createMenu: (menuValue: string, menuOptions?: Omit<UseMenuOptions, "open" | "onOpenChange">) => MenubarMenuInstance;

  /** Creates a radio group coordinator inside the active menu. */
  createRadioGroup: (radioOptions?: UseMenuRadioGroupOptions) => MenuRadioGroupInstance;

  /** Creates a nested submenu coordinator inside the active menu. */
  createSub: (subOptions?: Omit<UseMenuOptions, "parentMenu">) => MenuInstance;

  /** Menubar root container factory. */
  Root: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: MenubarRootProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Menu root element factory. */
  Menu: <T extends keyof SeidrElementTagNameMap = "div">(
    props: MenubarMenuProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Top-level menu trigger button factory. */
  Trigger: <T extends keyof SeidrElementTagNameMap = "button">(
    props?: MenubarTriggerProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Portal helper for the active menu dropdown. */
  Portal: (props?: MenubarPortalProps, children?: SeidrChild | SeidrChild[]) => SeidrChild;

  /** Menu floating dropdown content factory. */
  Content: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: MenubarContentProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => DerivedValue<SeidrElementTagNameMap[T] | null>;

  /** Selectable menu item element factory. */
  Item: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: MenubarItemProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Checkbox toggle menu item factory. */
  CheckboxItem: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: MenubarCheckboxItemProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Radio group container factory. */
  RadioGroup: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: MenubarRadioGroupProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Radio selection item factory. */
  RadioItem: <T extends keyof SeidrElementTagNameMap = "div">(
    props: MenubarRadioItemProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Submenu container factory. */
  Sub: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: MenubarSubProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Submenu trigger element factory. */
  SubTrigger: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: MenubarSubTriggerProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Submenu floating dropdown content factory. */
  SubContent: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: MenubarSubContentProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => DerivedValue<SeidrElementTagNameMap[T] | null>;

  /** Separator divider factory. */
  Separator: <T extends keyof SeidrElementTagNameMap = "hr">(
    props?: MenubarSeparatorProps<T>,
  ) => SeidrElementTagNameMap[T];

  /** Group container factory. */
  Group: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: MenubarGroupProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Group label factory. */
  GroupLabel: <T extends keyof SeidrElementTagNameMap = "span">(
    props?: MenubarGroupLabelProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Item label factory. */
  ItemLabel: <T extends keyof SeidrElementTagNameMap = "span">(
    props?: MenubarItemLabelProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Item description factory. */
  ItemDescription: <T extends keyof SeidrElementTagNameMap = "span">(
    props?: MenubarItemDescriptionProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Item indicator factory. */
  ItemIndicator: <T extends keyof SeidrElementTagNameMap = "span">(
    props?: MenubarItemIndicatorProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => DerivedValue<SeidrElementTagNameMap[T] | null>;

  /** Icon element factory. */
  Icon: <T extends keyof SeidrElementTagNameMap = "span">(
    props?: MenubarIconProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Arrow element factory. */
  Arrow: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: MenubarArrowProps<T>,
  ) => SeidrElementTagNameMap[T];
}

// ---------------------------------------------------------------------------
// Subcomponent Options & Props
// ---------------------------------------------------------------------------

export interface MenubarRootOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  as?: T;
  dataComponent?: string;
  instance?: UseMenubarResult;
  children?: SeidrChild | SeidrChild[];
}
export type MenubarRootProps<T extends keyof SeidrElementTagNameMap = "div"> = MenubarRootOptions<T> &
  SeidrElementProps<T>;

export interface MenubarMenuOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  as?: T;
  value: string;
  dataComponent?: string;
  instance?: UseMenubarResult;
  menuInstance?: MenubarMenuInstance;
  children?: SeidrChild | SeidrChild[];
}
export type MenubarMenuProps<T extends keyof SeidrElementTagNameMap = "div"> = MenubarMenuOptions<T> &
  SeidrElementProps<T>;

export interface MenubarTriggerOptions<T extends keyof SeidrElementTagNameMap = "button">
  extends MenuTriggerOptions<T> {
  menubarInstance?: UseMenubarResult;
  menuValue?: string;
  children?: SeidrChild | SeidrChild[];
}
export type MenubarTriggerProps<T extends keyof SeidrElementTagNameMap = "button"> = MenubarTriggerOptions<T> &
  SeidrElementProps<T>;

export type MenubarContentOptions<T extends keyof SeidrElementTagNameMap = "div"> = MenuContentOptions<T>;
export type MenubarContentProps<T extends keyof SeidrElementTagNameMap = "div"> = MenuContentProps<T>;
export type MenubarPortalProps = MenuPortalProps;

export type MenubarItemOptions<T extends keyof SeidrElementTagNameMap = "div"> = MenuItemOptions<T>;
export type MenubarItemProps<T extends keyof SeidrElementTagNameMap = "div"> = MenuItemProps<T>;

export type MenubarCheckboxItemOptions<T extends keyof SeidrElementTagNameMap = "div"> = MenuCheckboxItemOptions<T>;
export type MenubarCheckboxItemProps<T extends keyof SeidrElementTagNameMap = "div"> = MenuCheckboxItemProps<T>;

export type MenubarRadioGroupOptions<T extends keyof SeidrElementTagNameMap = "div"> = MenuRadioGroupOptions<T>;
export type MenubarRadioGroupProps<T extends keyof SeidrElementTagNameMap = "div"> = MenuRadioGroupProps<T>;

export type MenubarRadioItemOptions<T extends keyof SeidrElementTagNameMap = "div"> = MenuRadioItemOptions<T>;
export type MenubarRadioItemProps<T extends keyof SeidrElementTagNameMap = "div"> = MenuRadioItemProps<T>;

export type MenubarSubOptions<T extends keyof SeidrElementTagNameMap = "div"> = MenuSubOptions<T>;
export type MenubarSubProps<T extends keyof SeidrElementTagNameMap = "div"> = MenuSubProps<T>;

export type MenubarSubTriggerOptions<T extends keyof SeidrElementTagNameMap = "div"> = MenuSubTriggerOptions<T>;
export type MenubarSubTriggerProps<T extends keyof SeidrElementTagNameMap = "div"> = MenuSubTriggerProps<T>;

export type MenubarSubContentOptions<T extends keyof SeidrElementTagNameMap = "div"> = MenuSubContentOptions<T>;
export type MenubarSubContentProps<T extends keyof SeidrElementTagNameMap = "div"> = MenuSubContentProps<T>;

export type MenubarSeparatorOptions<T extends keyof SeidrElementTagNameMap = "hr"> = MenuSeparatorOptions<T>;
export type MenubarSeparatorProps<T extends keyof SeidrElementTagNameMap = "hr"> = MenuSeparatorProps<T>;

export type MenubarGroupOptions<T extends keyof SeidrElementTagNameMap = "div"> = MenuGroupOptions<T>;
export type MenubarGroupProps<T extends keyof SeidrElementTagNameMap = "div"> = MenuGroupProps<T>;

export type MenubarGroupLabelOptions<T extends keyof SeidrElementTagNameMap = "span"> = MenuGroupLabelOptions<T>;
export type MenubarGroupLabelProps<T extends keyof SeidrElementTagNameMap = "span"> = MenuGroupLabelProps<T>;

export type MenubarItemLabelOptions<T extends keyof SeidrElementTagNameMap = "span"> = MenuItemLabelOptions<T>;
export type MenubarItemLabelProps<T extends keyof SeidrElementTagNameMap = "span"> = MenuItemLabelProps<T>;

export type MenubarItemDescriptionOptions<T extends keyof SeidrElementTagNameMap = "span"> =
  MenuItemDescriptionOptions<T>;
export type MenubarItemDescriptionProps<T extends keyof SeidrElementTagNameMap = "span"> =
  MenuItemDescriptionProps<T>;

export type MenubarItemIndicatorOptions<T extends keyof SeidrElementTagNameMap = "span"> =
  MenuItemIndicatorOptions<T>;
export type MenubarItemIndicatorProps<T extends keyof SeidrElementTagNameMap = "span"> =
  MenuItemIndicatorProps<T>;

export type MenubarIconOptions<T extends keyof SeidrElementTagNameMap = "span"> = MenuIconOptions<T>;
export type MenubarIconProps<T extends keyof SeidrElementTagNameMap = "span"> = MenuIconProps<T>;

export type MenubarArrowProps<T extends keyof SeidrElementTagNameMap = "div"> = MenuArrowProps<T>;

/**
 * High-level declarative descriptor for each menu in Tier 1 `Menubar`.
 */
export interface MenubarMenuDescriptor {
  /** Unique identifier for the menu. */
  value: string;
  /** Trigger content or element. */
  trigger: SeidrChild | SeidrChild[];
  /** Child menu items rendered inside the dropdown content. */
  items?: ReactiveValue<MenuItemDescriptor[]>;
  /** Optional custom child elements rendered inside the dropdown content. */
  children?: SeidrChild | SeidrChild[];
  /** Whether this entire menu is disabled. */
  disabled?: boolean | ObservableValue<boolean>;
  /** Custom element props forwarded to the menu container element. */
  menuProps?: Partial<MenubarMenuProps>;
  /** Custom element props forwarded to the trigger button element. */
  triggerProps?: Partial<MenubarTriggerProps>;
  /** Custom element props forwarded to the content dropdown element. */
  contentProps?: Partial<MenubarContentProps>;
}

/**
 * High-level unified props for Tier 1 Menubar component.
 */
export interface MenubarProps<T extends keyof SeidrElementTagNameMap = "div">
  extends UseMenubarOptions {
  /** Underlying HTML tag for root container element. Defaults to "div". */
  as?: T;
  /** Declarative list of menus in the menubar. */
  menus?: ReactiveValue<MenubarMenuDescriptor[]>;
  /** Direct children when composing manually. */
  children?: SeidrChild | SeidrChild[];
}
