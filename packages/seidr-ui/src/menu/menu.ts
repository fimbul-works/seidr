import { createComponent, type ReactiveValue, type SeidrChild } from "@fimbul-works/seidr";
import { createMenu } from "./create-menu.js";
import type {
  MenuContentProps,
  MenuItemDescriptor,
  MenuProps,
  MenuRootProps,
  MenuTriggerProps,
  UseMenuOptions,
} from "./types.js";

/**
 * Unified all-in-one Menu dropdown component (Tier 1).
 * Composes Menu.Root, Menu.Trigger, Menu.Content, and Menu.List with full Popper floating
 * positioning, WAI-ARIA menu semantics, and roving keyboard navigation.
 */
export const Menu = createComponent(
  (props: MenuProps = {}) => {
    const {
      id,
      open,
      defaultOpen,
      onOpenChange,
      placement = "bottom-start",
      modal = true,
      preventScroll = false,
      forceMount = false,
      loop = true,
      closeOnSelect = true,
      parentMenu = null,
      portalTarget,
      as = "div",
      trigger,
      items,
      rootProps = {},
      triggerProps = {},
      contentProps = {},
      children,
    } = props;

    const options: UseMenuOptions = {
      id,
      open,
      defaultOpen,
      onOpenChange,
      placement,
      modal,
      preventScroll,
      forceMount,
      loop,
      closeOnSelect,
      parentMenu,
      portalTarget,
    };

    const menu = createMenu(options);

    return menu.Root(
      { as, ...rootProps },
      [
        trigger ? menu.Trigger(triggerProps, trigger) : null,
        menu.Content({ items, ...contentProps }, children),
      ],
    );
  },
  "Menu",
);

