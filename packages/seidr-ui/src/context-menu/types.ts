import type {
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
  UseMenuOptions,
} from "../menu/types.js";
import type { AnchorRect, Placement } from "../popper/types.js";

export type ContextMenuItemRegistration = MenuItemRegistration;
export type ContextMenuItemDescriptor = MenuItemDescriptor;
export type ContextMenuItemData = MenuItemData;
export type ContextMenuCheckboxItemData = MenuCheckboxItemData;
export type ContextMenuRadioItemDescriptor = MenuRadioItemDescriptor;
export type ContextMenuRadioGroupData = MenuRadioGroupData;
export type ContextMenuSubMenuData = MenuSubMenuData;
export type ContextMenuLeafDescriptor = MenuLeafDescriptor;
export type ContextMenuListRenderOptions = MenuListRenderOptions;

export interface UseContextMenuOptions extends Omit<UseMenuOptions, "getAnchorRect"> {
  /** Optional custom anchor rect getter. */
  getAnchorRect?: (anchor?: HTMLElement) => AnchorRect | undefined;
}

export interface ContextMenuTriggerOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  /** Underlying HTML tag. Defaults to "div". */
  as?: T;
  /** Whether the context menu trigger is disabled. When disabled, standard browser context menus are permitted. */
  disabled?: boolean;
  /** Coordinator instance created by `createContextMenu`. */
  instance?: ContextMenuInstance;
  /** Data component attribute override. Defaults to "context-menu". */
  dataComponent?: string;
  /** Inline style overrides or object. */
  style?: Record<string, any> | string;
}

export type ContextMenuTriggerProps<T extends keyof SeidrElementTagNameMap = "div"> =
  ContextMenuTriggerOptions<T> &
    Omit<SeidrElementProps<T>, keyof ContextMenuTriggerOptions<T>>;

export interface ContextMenuInstance extends Omit<MenuInstance, "Trigger"> {
  /** Reactive coordinate rect for virtual popper anchor. */
  anchorRect: Value<AnchorRect>;
  /** Imperative setter for virtual anchor coordinates. */
  setAnchorRect: (rect: AnchorRect) => void;
  /** Context area trigger element helper. */
  Trigger: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: ContextMenuTriggerProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
}

export type ContextMenuRadioGroupInstance = MenuRadioGroupInstance;

export interface ContextMenuRootOptions<T extends keyof SeidrElementTagNameMap = "div">
  extends MenuRootOptions<T> {}
export type ContextMenuRootProps<T extends keyof SeidrElementTagNameMap = "div"> = MenuRootProps<T>;

export interface ContextMenuContentOptions<T extends keyof SeidrElementTagNameMap = "div">
  extends MenuContentOptions<T> {}
export type ContextMenuContentProps<T extends keyof SeidrElementTagNameMap = "div"> = MenuContentProps<T>;

export interface ContextMenuItemOptions<T extends keyof SeidrElementTagNameMap = "div">
  extends MenuItemOptions<T> {}
export type ContextMenuItemProps<T extends keyof SeidrElementTagNameMap = "div"> = MenuItemProps<T>;

export interface ContextMenuCheckboxItemOptions<T extends keyof SeidrElementTagNameMap = "div">
  extends MenuCheckboxItemOptions<T> {}
export type ContextMenuCheckboxItemProps<T extends keyof SeidrElementTagNameMap = "div"> =
  MenuCheckboxItemProps<T>;

export interface ContextMenuRadioGroupOptions<T extends keyof SeidrElementTagNameMap = "div">
  extends MenuRadioGroupOptions<T> {}
export type ContextMenuRadioGroupProps<T extends keyof SeidrElementTagNameMap = "div"> =
  MenuRadioGroupProps<T>;

export interface ContextMenuRadioItemOptions<T extends keyof SeidrElementTagNameMap = "div">
  extends MenuRadioItemOptions<T> {}
export type ContextMenuRadioItemProps<T extends keyof SeidrElementTagNameMap = "div"> =
  MenuRadioItemProps<T>;

export interface ContextMenuSubOptions<T extends keyof SeidrElementTagNameMap = "div">
  extends MenuSubOptions<T> {}
export type ContextMenuSubProps<T extends keyof SeidrElementTagNameMap = "div"> = MenuSubProps<T>;

export interface ContextMenuSubTriggerOptions<T extends keyof SeidrElementTagNameMap = "div">
  extends MenuSubTriggerOptions<T> {}
export type ContextMenuSubTriggerProps<T extends keyof SeidrElementTagNameMap = "div"> =
  MenuSubTriggerProps<T>;

export interface ContextMenuSubContentOptions<T extends keyof SeidrElementTagNameMap = "div">
  extends MenuSubContentOptions<T> {}
export type ContextMenuSubContentProps<T extends keyof SeidrElementTagNameMap = "div"> =
  MenuSubContentProps<T>;

export interface ContextMenuSeparatorOptions<T extends keyof SeidrElementTagNameMap = "hr">
  extends MenuSeparatorOptions<T> {}
export type ContextMenuSeparatorProps<T extends keyof SeidrElementTagNameMap = "hr"> =
  MenuSeparatorProps<T>;

export interface ContextMenuGroupOptions<T extends keyof SeidrElementTagNameMap = "div">
  extends MenuGroupOptions<T> {}
export type ContextMenuGroupProps<T extends keyof SeidrElementTagNameMap = "div"> = MenuGroupProps<T>;

export interface ContextMenuGroupLabelOptions<T extends keyof SeidrElementTagNameMap = "span">
  extends MenuGroupLabelOptions<T> {}
export type ContextMenuGroupLabelProps<T extends keyof SeidrElementTagNameMap = "span"> =
  MenuGroupLabelProps<T>;

export interface ContextMenuItemLabelOptions<T extends keyof SeidrElementTagNameMap = "span">
  extends MenuItemLabelOptions<T> {}
export type ContextMenuItemLabelProps<T extends keyof SeidrElementTagNameMap = "span"> =
  MenuItemLabelProps<T>;

export interface ContextMenuItemDescriptionOptions<T extends keyof SeidrElementTagNameMap = "span">
  extends MenuItemDescriptionOptions<T> {}
export type ContextMenuItemDescriptionProps<T extends keyof SeidrElementTagNameMap = "span"> =
  MenuItemDescriptionProps<T>;

export interface ContextMenuItemIndicatorOptions<T extends keyof SeidrElementTagNameMap = "span">
  extends MenuItemIndicatorOptions<T> {}
export type ContextMenuItemIndicatorProps<T extends keyof SeidrElementTagNameMap = "span"> =
  MenuItemIndicatorProps<T>;

export interface ContextMenuIconOptions<T extends keyof SeidrElementTagNameMap = "span">
  extends MenuIconOptions<T> {}
export type ContextMenuIconProps<T extends keyof SeidrElementTagNameMap = "span"> = MenuIconProps<T>;

export type ContextMenuArrowProps<T extends keyof SeidrElementTagNameMap = "div"> = MenuArrowProps<T>;

/**
 * High-level unified props for Tier 1 ContextMenu component.
 */
export interface ContextMenuProps<T extends keyof SeidrElementTagNameMap = "div">
  extends UseContextMenuOptions {
  /** Underlying HTML tag for root container element. Defaults to "div". */
  as?: T;
  /** Content or trigger target area element responding to right-click or long-press. */
  trigger?: SeidrChild | SeidrChild[];
  /** Whether the context menu trigger is disabled. */
  disabled?: boolean;
  /** Declarative list of items or groups rendered dynamically inside the content. */
  items?: ReactiveValue<MenuItemDescriptor[]>;
  /** Props forwarded to the root element. */
  rootProps?: Omit<ContextMenuRootProps<T>, "instance" | "dataComponent">;
  /** Props forwarded to the trigger target area element. */
  triggerProps?: Omit<ContextMenuTriggerProps, "instance" | "dataComponent">;
  /** Props forwarded to the content dropdown element. */
  contentProps?: Omit<ContextMenuContentProps, "instance" | "dataComponent">;
  /** Child elements or custom composition rendered inside the menu content. */
  children?: SeidrChild | SeidrChild[];
}

