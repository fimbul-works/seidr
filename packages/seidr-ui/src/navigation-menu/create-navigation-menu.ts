import { isFn } from "@fimbul-works/hvat";
import {
  type DerivedValue,
  getDocument,
  Portal as PortalComponent,
  type SeidrChild,
  type SeidrElementTagNameMap,
  SeidrError,
  Show,
} from "@fimbul-works/seidr";
import { createMenu as createMenuCore } from "../menu/create-menu.js";
import { MenuArrow } from "../menu/menu-arrow.js";
import { MenuCheckboxItem } from "../menu/menu-checkbox-item.js";
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
import { NavigationMenuLink } from "./navigation-menu-link.js";
import { NavigationMenuList } from "./navigation-menu-list.js";
import { NavigationMenuMenu } from "./navigation-menu-menu.js";
import { NavigationMenuRoot } from "./navigation-menu-root.js";
import { NavigationMenuTrigger } from "./navigation-menu-trigger.js";
import { NavigationMenuViewport } from "./navigation-menu-viewport.js";
import type {
  NavigationMenuContentProps,
  NavigationMenuInstance,
  NavigationMenuLinkProps,
  NavigationMenuListProps,
  NavigationMenuMenuInstance,
  NavigationMenuMenuProps,
  NavigationMenuPortalProps,
  NavigationMenuRootProps,
  NavigationMenuTriggerProps,
  NavigationMenuViewportProps,
  UseNavigationMenuOptions,
} from "./types.js";
import { useNavigationMenu } from "./use-navigation-menu.js";

/**
 * Creates a headless coordinator for a NavigationMenu system (Tier 2).
 * Returns pre-bound element helpers and reactive navigation state.
 */
export function createNavigationMenu(
  options: UseNavigationMenuOptions = {},
): NavigationMenuInstance {
  const { dataComponent = "navigation-menu", ...navOptions } = options;
  const navMenu = useNavigationMenu({ dataComponent, ...navOptions });

  const createdMenus = new Map<string, NavigationMenuMenuInstance>();
  let activeCreatedMenu: NavigationMenuMenuInstance | undefined;

  const createMenu = (
    menuValue: string,
    menuOptions?: Omit<UseMenuOptions, "open" | "onOpenChange">,
  ): NavigationMenuMenuInstance => {
    const isThisMenuOpen = navMenu.value.as((v) => v === menuValue);

    const underlyingMenu = createMenuCore({
      dataComponent,
      portalTarget: navMenu.portalTarget,
      ...menuOptions,
      modal: false,
      placement:
        menuOptions?.placement ??
        (navMenu.orientation() === "horizontal" ? "bottom-start" : "right-start"),
      open: isThisMenuOpen,
      onOpenChange: (open) => {
        if (open) {
          navMenu.openMenu(menuValue);
        } else if (navMenu.value() === menuValue) {
          navMenu.closeMenu();
        }
      },
    });

    navMenu.registerMenu({
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
      props?: NavigationMenuTriggerProps<T>,
      children?: SeidrChild | SeidrChild[],
    ): SeidrElementTagNameMap[T] =>
      NavigationMenuTrigger<T>(
        {
          dataComponent,
          menuValue,
          navigationMenuInstance: navMenu,
          instance: underlyingMenu,
          ...props,
        } as NavigationMenuTriggerProps<T>,
        children,
      );

    const Content = <T extends keyof SeidrElementTagNameMap = "div">(
      props?: NavigationMenuContentProps<T>,
      children?: SeidrChild | SeidrChild[],
    ): DerivedValue<SeidrElementTagNameMap[T] | null> => {
      const {
        onkeydown: userOnKeyDown,
        onpointerenter: userOnPointerEnter,
        onpointerleave: userOnPointerLeave,
        ...restProps
      } = props ?? {};

      const handleContentKeyDown = (e: KeyboardEvent) => {
        if (isFn(userOnKeyDown)) {
          Reflect.apply(userOnKeyDown, e.currentTarget, [e]);
        }
        if (e.defaultPrevented) return;

        if (navMenu.orientation() === "horizontal") {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            e.stopPropagation();
            navMenu.nextMenu(true);
            return;
          }
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            e.stopPropagation();
            navMenu.prevMenu(true);
            return;
          }
        }
      };

      const handlePointerEnter = (e: PointerEvent) => {
        if (isFn(userOnPointerEnter)) {
          Reflect.apply(userOnPointerEnter, e.currentTarget, [e]);
        }
        if (e.defaultPrevented) return;

        navMenu.cancelTimers();
      };

      const handlePointerLeave = (e: PointerEvent) => {
        if (isFn(userOnPointerLeave)) {
          Reflect.apply(userOnPointerLeave, e.currentTarget, [e]);
        }
        if (e.defaultPrevented) return;

        navMenu.startLeaveTimer();
      };

      return underlyingMenu.Content<T>(
        {
          dataComponent,
          ...restProps,
          onkeydown: handleContentKeyDown,
          onpointerenter: handlePointerEnter,
          onpointerleave: handlePointerLeave,
        } as MenuContentProps<T>,
        children,
      );
    };

    const Portal = (props: NavigationMenuPortalProps = {}, children?: SeidrChild | SeidrChild[]): SeidrChild => {
      const configuredTarget = props.target ?? underlyingMenu.portalTarget ?? navMenu.portalTarget;
      underlyingMenu.portalTarget = undefined;
      const renderPortal = () => {
        const target = configuredTarget ?? navMenu.viewportRef() ?? getDocument().body;
        return PortalComponent(target, () => children ?? null, "NavigationMenuPortal");
      };
      if (underlyingMenu.forceMount) {
        return renderPortal();
      }
      return Show(underlyingMenu.isOpen, renderPortal);
    };

    const menuInstance: NavigationMenuMenuInstance = {
      ...underlyingMenu,
      menuValue,
      Trigger,
      Portal,
      Content,
    };

    createdMenus.set(menuValue, menuInstance);
    activeCreatedMenu = menuInstance;
    return menuInstance;
  };

  const Root = <T extends keyof SeidrElementTagNameMap = "nav">(
    props?: NavigationMenuRootProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    NavigationMenuRoot<T>(
      { dataComponent, instance: navMenu, ...props } as NavigationMenuRootProps<T>,
      children,
    );

  const List = <T extends keyof SeidrElementTagNameMap = "ul">(
    props?: NavigationMenuListProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    NavigationMenuList<T>(
      { dataComponent, instance: navMenu, ...props } as NavigationMenuListProps<T>,
      children,
    );

  const Menu = <T extends keyof SeidrElementTagNameMap = "li">(
    props: NavigationMenuMenuProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] => {
    let menuInst = createdMenus.get(props.value);
    if (!menuInst) {
      menuInst = createMenu(props.value);
    }
    activeCreatedMenu = menuInst;
    return NavigationMenuMenu<T>(
      {
        dataComponent,
        instance: navMenu,
        menuInstance: menuInst,
        ...props,
      } as NavigationMenuMenuProps<T>,
      children,
    );
  };

  const Trigger = <T extends keyof SeidrElementTagNameMap = "button">(
    props?: NavigationMenuTriggerProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] => {
    const targetMenu = props?.menuValue
      ? createdMenus.get(props.menuValue) ?? createMenu(props.menuValue)
      : activeCreatedMenu;

    if (!targetMenu) {
      throw new SeidrError(
        "NavigationMenuTrigger requires either a menuValue prop or an active NavigationMenuMenu context",
      );
    }

    return targetMenu.Trigger<T>(props, children);
  };

  const Portal = (props?: NavigationMenuPortalProps, children?: SeidrChild | SeidrChild[]): SeidrChild => {
    const targetMenu = activeCreatedMenu;
    if (!targetMenu) {
      throw new SeidrError("NavigationMenuPortal requires an active NavigationMenuMenu context");
    }
    return targetMenu.Portal(props, children);
  };

  const Content = <T extends keyof SeidrElementTagNameMap = "div">(
    props?: NavigationMenuContentProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): DerivedValue<SeidrElementTagNameMap[T] | null> => {
    const targetMenu = activeCreatedMenu;
    if (!targetMenu) {
      throw new SeidrError("NavigationMenuContent requires an active NavigationMenuMenu context");
    }
    return targetMenu.Content<T>(props, children);
  };

  const Link = <T extends keyof SeidrElementTagNameMap = "a">(
    props?: NavigationMenuLinkProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    NavigationMenuLink<T>(
      {
        dataComponent,
        navigationMenuInstance: navMenu,
        ...props,
      } as NavigationMenuLinkProps<T>,
      children,
    );

  const Viewport = <T extends keyof SeidrElementTagNameMap = "div">(
    props?: NavigationMenuViewportProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    NavigationMenuViewport<T>(
      {
        dataComponent,
        instance: navMenu,
        ...props,
      } as NavigationMenuViewportProps<T>,
      children,
    );

  const Item = <T extends keyof SeidrElementTagNameMap = "div">(
    props?: MenuItemProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] => {
    const targetMenu = activeCreatedMenu;
    if (!targetMenu) {
      throw new SeidrError("NavigationMenu.Item requires an active NavigationMenuMenu context");
    }
    return targetMenu.Item<T>(props, children);
  };

  const CheckboxItem = <T extends keyof SeidrElementTagNameMap = "div">(
    props?: MenuCheckboxItemProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] => {
    const targetMenu = activeCreatedMenu;
    if (!targetMenu) {
      throw new SeidrError("NavigationMenu.CheckboxItem requires an active NavigationMenuMenu context");
    }
    return targetMenu.CheckboxItem<T>(props, children);
  };

  const RadioGroup = <T extends keyof SeidrElementTagNameMap = "div">(
    props?: MenuRadioGroupProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] => {
    const targetMenu = activeCreatedMenu;
    if (!targetMenu) {
      throw new SeidrError("NavigationMenu.RadioGroup requires an active NavigationMenuMenu context");
    }
    return targetMenu.RadioGroup<T>(props, children);
  };

  const RadioItem = <T extends keyof SeidrElementTagNameMap = "div">(
    props: MenuRadioItemProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] => {
    const targetMenu = activeCreatedMenu;
    if (!targetMenu) {
      throw new SeidrError("NavigationMenu.RadioItem requires an active NavigationMenuMenu context");
    }
    return targetMenu.RadioItem<T>(props, children);
  };

  const Sub = <T extends keyof SeidrElementTagNameMap = "div">(
    props?: MenuSubProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] => {
    const targetMenu = activeCreatedMenu;
    if (!targetMenu) {
      throw new SeidrError("NavigationMenu.Sub requires an active NavigationMenuMenu context");
    }
    return targetMenu.Sub<T>(props, children);
  };

  const SubTrigger = <T extends keyof SeidrElementTagNameMap = "div">(
    props?: MenuSubTriggerProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] => {
    const targetMenu = activeCreatedMenu;
    if (!targetMenu) {
      throw new SeidrError("NavigationMenu.SubTrigger requires an active NavigationMenuMenu context");
    }
    return targetMenu.SubTrigger<T>(props, children);
  };

  const SubContent = <T extends keyof SeidrElementTagNameMap = "div">(
    props?: MenuSubContentProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): DerivedValue<SeidrElementTagNameMap[T] | null> => {
    const targetMenu = activeCreatedMenu;
    if (!targetMenu) {
      throw new SeidrError("NavigationMenu.SubContent requires an active NavigationMenuMenu context");
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
      throw new SeidrError("createRadioGroup requires an active NavigationMenuMenu context");
    }
    return activeCreatedMenu.createRadioGroup(radioOptions);
  };

  const createSub = (
    subOptions?: Omit<UseMenuOptions, "parentMenu">,
  ): MenuInstance => {
    if (!activeCreatedMenu) {
      throw new SeidrError("createSub requires an active NavigationMenuMenu context");
    }
    return activeCreatedMenu.createSub(subOptions);
  };

  return {
    ...navMenu,
    createMenu,
    createRadioGroup,
    createSub,
    Root,
    List,
    Menu,
    Trigger,
    Portal,
    Content,
    Link,
    Viewport,
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

