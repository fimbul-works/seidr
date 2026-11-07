import type {
  ReactiveValue,
  SeidrChild,
  SeidrElementTagNameMap,
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
} from "../menu/types.js";

export type DropdownMenuItemRegistration = MenuItemRegistration;
export type DropdownMenuItemDescriptor = MenuItemDescriptor;
export type DropdownMenuItemData = MenuItemData;
export type DropdownMenuCheckboxItemData = MenuCheckboxItemData;
export type DropdownMenuRadioItemDescriptor = MenuRadioItemDescriptor;
export type DropdownMenuRadioGroupData = MenuRadioGroupData;
export type DropdownMenuSubMenuData = MenuSubMenuData;
export type DropdownMenuLeafDescriptor = MenuLeafDescriptor;
export type DropdownMenuListRenderOptions = MenuListRenderOptions;

export interface UseDropdownMenuOptions extends UseMenuOptions {}

export type DropdownMenuInstance = MenuInstance;
export type DropdownMenuRadioGroupInstance = MenuRadioGroupInstance;

export interface DropdownMenuRootOptions<T extends keyof SeidrElementTagNameMap = "div">
  extends MenuRootOptions<T> {}
export type DropdownMenuRootProps<T extends keyof SeidrElementTagNameMap = "div"> = MenuRootProps<T>;

export interface DropdownMenuTriggerOptions<T extends keyof SeidrElementTagNameMap = "button">
  extends MenuTriggerOptions<T> {}
export type DropdownMenuTriggerProps<T extends keyof SeidrElementTagNameMap = "button"> = MenuTriggerProps<T>;

export interface DropdownMenuContentOptions<T extends keyof SeidrElementTagNameMap = "div">
  extends MenuContentOptions<T> {}
export type DropdownMenuContentProps<T extends keyof SeidrElementTagNameMap = "div"> = MenuContentProps<T>;

export interface DropdownMenuItemOptions<T extends keyof SeidrElementTagNameMap = "div">
  extends MenuItemOptions<T> {}
export type DropdownMenuItemProps<T extends keyof SeidrElementTagNameMap = "div"> = MenuItemProps<T>;

export interface DropdownMenuCheckboxItemOptions<T extends keyof SeidrElementTagNameMap = "div">
  extends MenuCheckboxItemOptions<T> {}
export type DropdownMenuCheckboxItemProps<T extends keyof SeidrElementTagNameMap = "div"> =
  MenuCheckboxItemProps<T>;

export interface DropdownMenuRadioGroupOptions<T extends keyof SeidrElementTagNameMap = "div">
  extends MenuRadioGroupOptions<T> {}
export type DropdownMenuRadioGroupProps<T extends keyof SeidrElementTagNameMap = "div"> =
  MenuRadioGroupProps<T>;

export interface DropdownMenuRadioItemOptions<T extends keyof SeidrElementTagNameMap = "div">
  extends MenuRadioItemOptions<T> {}
export type DropdownMenuRadioItemProps<T extends keyof SeidrElementTagNameMap = "div"> =
  MenuRadioItemProps<T>;

export interface DropdownMenuSubOptions<T extends keyof SeidrElementTagNameMap = "div">
  extends MenuSubOptions<T> {}
export type DropdownMenuSubProps<T extends keyof SeidrElementTagNameMap = "div"> = MenuSubProps<T>;

export interface DropdownMenuSubTriggerOptions<T extends keyof SeidrElementTagNameMap = "div">
  extends MenuSubTriggerOptions<T> {}
export type DropdownMenuSubTriggerProps<T extends keyof SeidrElementTagNameMap = "div"> =
  MenuSubTriggerProps<T>;

export interface DropdownMenuSubContentOptions<T extends keyof SeidrElementTagNameMap = "div">
  extends MenuSubContentOptions<T> {}
export type DropdownMenuSubContentProps<T extends keyof SeidrElementTagNameMap = "div"> =
  MenuSubContentProps<T>;

export interface DropdownMenuSeparatorOptions<T extends keyof SeidrElementTagNameMap = "hr">
  extends MenuSeparatorOptions<T> {}
export type DropdownMenuSeparatorProps<T extends keyof SeidrElementTagNameMap = "hr"> =
  MenuSeparatorProps<T>;

export interface DropdownMenuGroupOptions<T extends keyof SeidrElementTagNameMap = "div">
  extends MenuGroupOptions<T> {}
export type DropdownMenuGroupProps<T extends keyof SeidrElementTagNameMap = "div"> = MenuGroupProps<T>;

export interface DropdownMenuGroupLabelOptions<T extends keyof SeidrElementTagNameMap = "span">
  extends MenuGroupLabelOptions<T> {}
export type DropdownMenuGroupLabelProps<T extends keyof SeidrElementTagNameMap = "span"> =
  MenuGroupLabelProps<T>;

export interface DropdownMenuItemLabelOptions<T extends keyof SeidrElementTagNameMap = "span">
  extends MenuItemLabelOptions<T> {}
export type DropdownMenuItemLabelProps<T extends keyof SeidrElementTagNameMap = "span"> =
  MenuItemLabelProps<T>;

export interface DropdownMenuItemDescriptionOptions<T extends keyof SeidrElementTagNameMap = "span">
  extends MenuItemDescriptionOptions<T> {}
export type DropdownMenuItemDescriptionProps<T extends keyof SeidrElementTagNameMap = "span"> =
  MenuItemDescriptionProps<T>;

export interface DropdownMenuItemIndicatorOptions<T extends keyof SeidrElementTagNameMap = "span">
  extends MenuItemIndicatorOptions<T> {}
export type DropdownMenuItemIndicatorProps<T extends keyof SeidrElementTagNameMap = "span"> =
  MenuItemIndicatorProps<T>;

export interface DropdownMenuIconOptions<T extends keyof SeidrElementTagNameMap = "span">
  extends MenuIconOptions<T> {}
export type DropdownMenuIconProps<T extends keyof SeidrElementTagNameMap = "span"> = MenuIconProps<T>;

export type DropdownMenuArrowProps<T extends keyof SeidrElementTagNameMap = "div"> = MenuArrowProps<T>;

/**
 * High-level unified props for Tier 1 DropdownMenu component.
 */
export interface DropdownMenuProps<T extends keyof SeidrElementTagNameMap = "div">
  extends UseDropdownMenuOptions {
  /** Underlying HTML tag for root container element. Defaults to "div". */
  as?: T;
  /** Content or trigger element to activate the dropdown menu. */
  trigger?: SeidrChild | SeidrChild[];
  /** Declarative list of items or groups rendered dynamically inside the content. */
  items?: ReactiveValue<MenuItemDescriptor[]>;
  /** Props forwarded to the root element. */
  rootProps?: Omit<DropdownMenuRootProps<T>, "instance" | "dataComponent">;
  /** Props forwarded to the trigger button element. */
  triggerProps?: Omit<DropdownMenuTriggerProps, "instance" | "dataComponent">;
  /** Props forwarded to the content dropdown element. */
  contentProps?: Omit<DropdownMenuContentProps, "instance" | "dataComponent">;
  /** Child elements or custom composition rendered inside the menu content. */
  children?: SeidrChild | SeidrChild[];
}

