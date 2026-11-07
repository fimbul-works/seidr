import { createComponent } from "@fimbul-works/seidr";
import { createDropdownMenu } from "./create-dropdown-menu.js";
import type { DropdownMenuProps, UseDropdownMenuOptions } from "./types.js";

/**
 * Unified all-in-one DropdownMenu component (Tier 1).
 * Composes Root, Trigger, Content, and List with full Popper floating
 * positioning, WAI-ARIA dropdown menu semantics, and roving keyboard navigation.
 */
export const DropdownMenu = createComponent(
  (props: DropdownMenuProps = {}) => {
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

    const options: UseDropdownMenuOptions = {
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
      dataComponent: "dropdown-menu",
    };

    const dropdown = createDropdownMenu(options);

    return dropdown.Root(
      { as, ...rootProps },
      [
        trigger ? dropdown.Trigger(triggerProps, trigger) : null,
        dropdown.Content({ items, ...contentProps }, children),
      ],
    );
  },
  "DropdownMenu",
);

