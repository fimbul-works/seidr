import { createComponent } from "@fimbul-works/seidr";
import { DATA_COMPONENT_CONTEXT_MENU } from "../constants.js";
import { createContextMenu } from "./create-context-menu.js";
import type { ContextMenuProps, UseContextMenuOptions } from "./types.js";

/**
 * Unified all-in-one ContextMenu component (Tier 1).
 * Composes Root, Trigger (right-click / long-press target area), Content, and List with virtual
 * popper floating coordinates, WAI-ARIA context menu semantics, and roving keyboard navigation.
 */
export const ContextMenu = createComponent((props: ContextMenuProps = {}) => {
  const {
    id,
    open,
    defaultOpen,
    onOpenChange,
    placement = "right-start",
    modal = true,
    preventScroll = false,
    forceMount = false,
    loop = true,
    closeOnSelect = true,
    parentMenu = null,
    getAnchorRect,
    portalTarget,
    as = "div",
    trigger,
    disabled = false,
    items,
    rootProps = {},
    triggerProps = {},
    contentProps = {},
    children,
  } = props;

  const options: UseContextMenuOptions = {
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
    getAnchorRect,
    portalTarget,
    dataComponent: DATA_COMPONENT_CONTEXT_MENU,
  };

  const contextMenu = createContextMenu(options);

  return contextMenu.Root({ as, ...rootProps }, [
    trigger ? contextMenu.Trigger({ disabled, ...triggerProps }, trigger) : null,
    contextMenu.Content({ items, ...contentProps }, children),
  ]);
}, "ContextMenu");
