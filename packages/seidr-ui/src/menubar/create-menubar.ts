import { isFn } from "@fimbul-works/hvat";
import {
  type DerivedValue,
  type SeidrChild,
  type SeidrElementTagNameMap,
  SeidrError,
  wrapValue,
} from "@fimbul-works/seidr";
import { createMenu as createMenuCore } from "../menu/create-menu.js";
import { MenuArrow } from "../menu/menu-arrow.js";
import { MenuCheckboxItem } from "../menu/menu-checkbox-item.js";
import { MenuContent } from "../menu/menu-content.js";
import { MenuGroup } from "../menu/menu-group.js";
import { MenuGroupLabel } from "../menu/menu-group-label.js";
import { MenuIcon } from "../menu/menu-icon.js";
import { MenuItem } from "../menu/menu-item.js";
import { MenuItemDescription } from "../menu/menu-item-description.js";
import { MenuItemIndicator } from "../menu/menu-item-indicator.js";
import { MenuItemLabel } from "../menu/menu-item-label.js";
import { MenuRadioGroup } from "../menu/menu-radio-group.js";
import { MenuRadioItem } from "../menu/menu-radio-item.js";
import { MenuSeparator } from "../menu/menu-separator.js";
import { MenuSub } from "../menu/menu-sub.js";
import { MenuSubContent } from "../menu/menu-sub-content.js";
import { MenuSubTrigger } from "../menu/menu-sub-trigger.js";
import type {
  MenuArrowProps,
  MenuCheckboxItemProps,
  MenuContentProps,
  MenuGroupLabelProps,
  MenuGroupProps,
  MenuIconProps,
  MenuInstance,
  MenuItemDescriptionProps,
  MenuItemIndicatorProps,
  MenuItemLabelProps,
  MenuItemProps,
  MenuRadioGroupInstance,
  MenuRadioGroupProps,
  MenuRadioItemProps,
  MenuSeparatorProps,
  MenuSubContentProps,
  MenuSubProps,
  MenuSubTriggerProps,
  UseMenuOptions,
  UseMenuRadioGroupOptions,
} from "../menu/types.js";
import { MenubarMenu } from "./menubar-menu.js";
import { MenubarRoot } from "./menubar-root.js";
import { MenubarTrigger } from "./menubar-trigger.js";
import type {
  MenubarContentProps,
  MenubarInstance,
  MenubarMenuInstance,
  MenubarMenuProps,
  MenubarPortalProps,
  MenubarRootProps,
  MenubarTriggerProps,
  UseMenubarOptions,
} from "./types.js";
import { useMenubar } from "./use-menubar.js";

/**
 * Creates a headless coordinator for a Menubar system (Tier 2).
 * Returns pre-bound element helpers and reactive navigation state.
 */
export function createMenubar(options: UseMenubarOptions = {}): MenubarInstance {
  const { dataComponent = "menubar", ...menubarOptions } = options;
  const menubar = useMenubar({ dataComponent, ...menubarOptions });

  const createdMenus = new Map<string, MenubarMenuInstance>();
  let activeCreatedMenu: MenubarMenuInstance | undefined;

  const createMenu = (
    menuValue: string,
    menuOptions?: Omit<UseMenuOptions, "open" | "onOpenChange">,
  ): MenubarMenuInstance => {
    const isThisMenuOpen = menubar.value.as((v) => v === menuValue);

    const underlyingMenu = createMenuCore({
      dataComponent,
      portalTarget: menubar.portalTarget,
      ...menuOptions,
      modal: false,
      placement:
        menuOptions?.placement ??
        (menubar.orientation === "horizontal" ? "bottom-start" : "right-start"),
      open: isThisMenuOpen,
      onOpenChange: (open) => {
        if (open) {
          menubar.openMenu(menuValue);
        } else if (menubar.value() === menuValue) {
          menubar.closeMenu();
        }
      },
    });

    menubar.registerMenu({
      value: menuValue,
      getTriggerElement: () => underlyingMenu.triggerRef(),
      getContentElement: () => underlyingMenu.contentRef(),
      containsTarget: (target) => underlyingMenu.containsNode(target),
      open: (autoFocusFirst) => {
        underlyingMenu.open();
        if (autoFocusFirst) {
          setTimeout(() => {
            underlyingMenu.highlightItem(
              underlyingMenu.highlightedValue() ?? "first",
            );
          }, 0);
        }
      },
      close: () => underlyingMenu.close(),
      focusTrigger: () => underlyingMenu.triggerRef()?.focus(),
      isDisabled: () => false,
    });

    const Trigger = <T extends keyof SeidrElementTagNameMap = "button">(
      props?: MenubarTriggerProps<T>,
      children?: SeidrChild | SeidrChild[],
    ): SeidrElementTagNameMap[T] =>
      MenubarTrigger<T>(
        {
          dataComponent,
          menuValue,
          menubarInstance: menubar,
          instance: underlyingMenu,
          ...props,
        } as MenubarTriggerProps<T>,
        children,
      );

    const Content = <T extends keyof SeidrElementTagNameMap = "div">(
      props?: MenubarContentProps<T>,
      children?: SeidrChild | SeidrChild[],
    ): DerivedValue<SeidrElementTagNameMap[T] | null> => {
      const { onkeydown: userOnKeyDown, ...restProps } = props ?? {};

      const handleContentKeyDown = (e: KeyboardEvent) => {
        if (isFn(userOnKeyDown)) {
          Reflect.apply(userOnKeyDown, e.currentTarget, [e]);
        }
        if (e.defaultPrevented) return;

        // Desktop horizontal menubar switching when active inside a menu dropdown
        if (menubar.orientation === "horizontal") {
          if (e.key === "ArrowRight") {
            const currentHighlight = underlyingMenu.highlightedValue();
            // If current item is not a submenu trigger, switch to next menu
            e.preventDefault();
            e.stopPropagation();
            menubar.nextMenu(true);
            return;
          }
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            e.stopPropagation();
            menubar.prevMenu(true);
            return;
          }
        }
      };

      return underlyingMenu.Content<T>(
        {
          dataComponent,
          ...restProps,
          onkeydown: handleContentKeyDown,
        } as MenuContentProps<T>,
        children,
      );
    };

    const menuInstance: MenubarMenuInstance = {
      ...underlyingMenu,
      menuValue,
      Trigger,
      Content,
    };

    createdMenus.set(menuValue, menuInstance);
    activeCreatedMenu = menuInstance;
    return menuInstance;
  };

  const Root = <T extends keyof SeidrElementTagNameMap = "div">(
    props?: MenubarRootProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    MenubarRoot<T>(
      { dataComponent, instance: menubar, ...props } as MenubarRootProps<T>,
      children,
    );

  const Menu = <T extends keyof SeidrElementTagNameMap = "div">(
    props: MenubarMenuProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] => {
    let menuInst = createdMenus.get(props.value);
    if (!menuInst) {
      menuInst = createMenu(props.value);
    }
    activeCreatedMenu = menuInst;
    return MenubarMenu<T>(
      {
        dataComponent,
        instance: menubar,
        menuInstance: menuInst,
        ...props,
      } as MenubarMenuProps<T>,
      children,
    );
  };

  const Trigger = <T extends keyof SeidrElementTagNameMap = "button">(
    props?: MenubarTriggerProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] => {
    const targetMenu = props?.menuValue
      ? createdMenus.get(props.menuValue) ?? createMenu(props.menuValue)
      : activeCreatedMenu;

    if (!targetMenu) {
      throw new SeidrError(
        "MenubarTrigger requires either a menuValue prop or an active MenubarMenu context",
      );
    }

    return targetMenu.Trigger<T>(props, children);
  };

  const Portal = (props?: MenubarPortalProps, children?: SeidrChild | SeidrChild[]): SeidrChild => {
    const targetMenu = activeCreatedMenu;
    if (!targetMenu) {
      throw new SeidrError("MenubarPortal requires an active MenubarMenu context");
    }
    return targetMenu.Portal(props, children);
  };

  const Content = <T extends keyof SeidrElementTagNameMap = "div">(
    props?: MenubarContentProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): DerivedValue<SeidrElementTagNameMap[T] | null> => {
    const targetMenu = activeCreatedMenu;
    if (!targetMenu) {
      throw new SeidrError("MenubarContent requires an active MenubarMenu context");
    }
    return targetMenu.Content<T>(props, children);
  };

  const Item = <T extends keyof SeidrElementTagNameMap = "div">(
    props?: MenuItemProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] => {
    const targetMenu = activeCreatedMenu;
    if (!targetMenu) {
      throw new SeidrError("Menubar.Item requires an active MenubarMenu context");
    }
    return targetMenu.Item<T>(props, children);
  };

  const CheckboxItem = <T extends keyof SeidrElementTagNameMap = "div">(
    props?: MenuCheckboxItemProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] => {
    const targetMenu = activeCreatedMenu;
    if (!targetMenu) {
      throw new SeidrError("Menubar.CheckboxItem requires an active MenubarMenu context");
    }
    return targetMenu.CheckboxItem<T>(props, children);
  };

  const RadioGroup = <T extends keyof SeidrElementTagNameMap = "div">(
    props?: MenuRadioGroupProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] => {
    const targetMenu = activeCreatedMenu;
    if (!targetMenu) {
      throw new SeidrError("Menubar.RadioGroup requires an active MenubarMenu context");
    }
    return targetMenu.RadioGroup<T>(props, children);
  };

  const RadioItem = <T extends keyof SeidrElementTagNameMap = "div">(
    props: MenuRadioItemProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] => {
    const targetMenu = activeCreatedMenu;
    if (!targetMenu) {
      throw new SeidrError("Menubar.RadioItem requires an active MenubarMenu context");
    }
    return targetMenu.RadioItem<T>(props, children);
  };

  const Sub = <T extends keyof SeidrElementTagNameMap = "div">(
    props?: MenuSubProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] => {
    const targetMenu = activeCreatedMenu;
    if (!targetMenu) {
      throw new SeidrError("Menubar.Sub requires an active MenubarMenu context");
    }
    return targetMenu.Sub<T>(props, children);
  };

  const SubTrigger = <T extends keyof SeidrElementTagNameMap = "div">(
    props?: MenuSubTriggerProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] => {
    const targetMenu = activeCreatedMenu;
    if (!targetMenu) {
      throw new SeidrError("Menubar.SubTrigger requires an active MenubarMenu context");
    }
    return targetMenu.SubTrigger<T>(props, children);
  };

  const SubContent = <T extends keyof SeidrElementTagNameMap = "div">(
    props?: MenuSubContentProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): DerivedValue<SeidrElementTagNameMap[T] | null> => {
    const targetMenu = activeCreatedMenu;
    if (!targetMenu) {
      throw new SeidrError("Menubar.SubContent requires an active MenubarMenu context");
    }
    return targetMenu.SubContent<T>(props, children);
  };

  const Separator = <T extends keyof SeidrElementTagNameMap = "hr">(
    props?: MenuSeparatorProps<T>,
  ): SeidrElementTagNameMap[T] => {
    return MenuSeparator<T>({
      dataComponent,
      ...props,
      instance: activeCreatedMenu,
    } as MenuSeparatorProps<T>);
  };

  const Group = <T extends keyof SeidrElementTagNameMap = "div">(
    props?: MenuGroupProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] => {
    return MenuGroup<T>(
      { dataComponent, ...props, instance: activeCreatedMenu } as MenuGroupProps<T>,
      children,
    );
  };

  const GroupLabel = <T extends keyof SeidrElementTagNameMap = "span">(
    props?: MenuGroupLabelProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] => {
    return MenuGroupLabel<T>(
      {
        dataComponent,
        ...props,
        instance: activeCreatedMenu,
      } as MenuGroupLabelProps<T>,
      children,
    );
  };

  const ItemLabel = <T extends keyof SeidrElementTagNameMap = "span">(
    props?: MenuItemLabelProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] => {
    return MenuItemLabel<T>(
      {
        dataComponent,
        ...props,
        instance: activeCreatedMenu,
      } as MenuItemLabelProps<T>,
      children,
    );
  };

  const ItemDescription = <T extends keyof SeidrElementTagNameMap = "span">(
    props?: MenuItemDescriptionProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] => {
    return MenuItemDescription<T>(
      {
        dataComponent,
        ...props,
        instance: activeCreatedMenu,
      } as MenuItemDescriptionProps<T>,
      children,
    );
  };

  const ItemIndicator = <T extends keyof SeidrElementTagNameMap = "span">(
    props?: MenuItemIndicatorProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): DerivedValue<SeidrElementTagNameMap[T] | null> => {
    return MenuItemIndicator<T>(
      {
        dataComponent,
        ...props,
        instance: activeCreatedMenu,
      } as MenuItemIndicatorProps<T>,
      children,
    );
  };

  const Icon = <T extends keyof SeidrElementTagNameMap = "span">(
    props?: MenuIconProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] => {
    return MenuIcon<T>(
      { dataComponent, ...props, instance: activeCreatedMenu } as MenuIconProps<T>,
      children,
    );
  };

  const Arrow = <T extends keyof SeidrElementTagNameMap = "div">(
    props?: MenuArrowProps<T>,
  ): SeidrElementTagNameMap[T] => {
    return MenuArrow<T>({
      dataComponent,
      ...props,
      instance: activeCreatedMenu,
    } as MenuArrowProps<T>);
  };

  const createRadioGroup = (
    radioOptions?: UseMenuRadioGroupOptions,
  ): MenuRadioGroupInstance => {
    if (!activeCreatedMenu) {
      throw new SeidrError("createRadioGroup requires an active MenubarMenu context");
    }
    return activeCreatedMenu.createRadioGroup(radioOptions);
  };

  const createSub = (
    subOptions?: Omit<UseMenuOptions, "parentMenu">,
  ): MenuInstance => {
    if (!activeCreatedMenu) {
      throw new SeidrError("createSub requires an active MenubarMenu context");
    }
    return activeCreatedMenu.createSub(subOptions);
  };

  return {
    ...menubar,
    createMenu,
    createRadioGroup,
    createSub,
    Root,
    Menu,
    Trigger,
    Portal,
    Content,
    Item,
    CheckboxItem,
    RadioGroup,
    RadioItem,
    Sub,
    SubTrigger,
    SubContent,
    Separator,
    Group,
    GroupLabel,
    ItemLabel,
    ItemDescription,
    ItemIndicator,
    Icon,
    Arrow,
  };
}
