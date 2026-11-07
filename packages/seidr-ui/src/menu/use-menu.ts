import { isFn, isNullish } from "@fimbul-works/hvat";
import {
  createRef,
  createValue,
  type DerivedValue,
  inClient,
  isValue,
  mergeValues,
  onUnmounted,
  type Ref,
  unwrapValue,
  useId,
  type Value,
  wrapValue,
} from "@fimbul-works/seidr";
import { useInteractOutside } from "../hooks/use-interact-outside.js";
import { usePopper } from "../popper/use-popper.js";
import type {
  MenuItemRegistration,
  UseMenuOptions,
  UseMenuRadioGroupOptions,
  UseMenuRadioGroupResult,
  UseMenuResult,
} from "./types.js";

/**
 * Headless hook managing state, accessibility attributes, keyboard navigation,
 * typeahead, and Popper positioning for an accessible WAI-ARIA Menu.
 */
export function useMenu(options: UseMenuOptions = {}): UseMenuResult {
  const id = options.id ?? useId("menu");
  const modal = options.modal ?? true;
  const forceMount = options.forceMount ?? false;
  const loop = options.loop ?? true;
  const parentMenu = options.parentMenu ?? null;

  const triggerId: DerivedValue<string> = createValue(`${id}-trigger`).as((v) => v);
  const contentId: DerivedValue<string> = createValue(`${id}-content`).as((v) => v);

  // Controlled or uncontrolled open state
  const rawOpen = options.open;
  const isOpenState: Value<boolean> = createValue<boolean>(
    Boolean(unwrapValue(rawOpen) ?? options.defaultOpen ?? false),
  );
  if (rawOpen !== undefined && isValue(rawOpen)) {
    rawOpen.watch((next: boolean) => isOpenState(Boolean(next)));
  }

  const isOpen: DerivedValue<boolean> = isOpenState.as((o) => o);

  const setOpen = (newVal: boolean) => {
    if (isOpenState() === newVal) return;
    isOpenState(newVal);
    options.onOpenChange?.(newVal);
  };

  const triggerRef: Ref<HTMLElement> = createRef<HTMLElement>();
  const contentRef: Ref<HTMLElement> = createRef<HTMLElement>();

  // Popper positioning
  const popper = usePopper({
    anchorRef: triggerRef,
    contentRef: contentRef,
    placement: options.placement ?? (parentMenu ? "right-start" : "bottom-start"),
    flip: true,
    gutter: 4,
    getAnchorRect: options.getAnchorRect,
  });

  const highlightedValue: Value<string | null> = createValue<string | null>(null);

  // Item registry
  const items = new Map<string, MenuItemRegistration>();
  const itemOrder: string[] = [];

  // Child submenus registry
  const submenus = new Set<UseMenuResult>();

  const registerItem = (data: MenuItemRegistration) => {
    items.set(data.value, data);
    if (!itemOrder.includes(data.value)) {
      itemOrder.push(data.value);
    }

    return () => {
      items.delete(data.value);
      const idx = itemOrder.indexOf(data.value);
      if (idx !== -1) {
        itemOrder.splice(idx, 1);
      }
      if (highlightedValue() === data.value) {
        highlightedValue(null);
      }
    };
  };

  const registerSubmenu = (child: UseMenuResult) => {
    submenus.add(child);
    return () => {
      submenus.delete(child);
    };
  };

  const highlightItem = (val: string | null) => {
    highlightedValue(val);
    if (val) {
      const reg = items.get(val);
      const el = reg?.getElement();
      if (el) {
        el.focus();
      }
    }
  };

  const openMenu = () => {
    setOpen(true);
    inClient(() => {
      popper.updatePosition();
    });
  };

  const closeMenu = (recursively = false) => {
    setOpen(false);
    highlightedValue(null);
    for (const sub of submenus) {
      sub.close(false);
    }
    if (recursively && parentMenu) {
      parentMenu.close(true);
    }
  };

  const toggleMenu = () => {
    if (isOpenState()) {
      closeMenu(false);
    } else {
      openMenu();
    }
  };

  // Helper to find enabled items in order
  const getEnabledItems = (): MenuItemRegistration[] => {
    const list: MenuItemRegistration[] = [];
    for (const key of itemOrder) {
      const item = items.get(key);
      if (item && !item.isDisabled()) {
        list.push(item);
      }
    }
    return list;
  };

  const moveHighlight = (direction: "next" | "prev" | "first" | "last") => {
    const enabled = getEnabledItems();
    if (enabled.length === 0) return;

    const currentKey = highlightedValue();
    const currentIndex = currentKey ? enabled.findIndex((i) => i.value === currentKey) : -1;

    let targetIndex = 0;
    if (direction === "first") {
      targetIndex = 0;
    } else if (direction === "last") {
      targetIndex = enabled.length - 1;
    } else if (direction === "next") {
      if (currentIndex === -1) {
        targetIndex = 0;
      } else if (currentIndex < enabled.length - 1) {
        targetIndex = currentIndex + 1;
      } else if (loop) {
        targetIndex = 0;
      } else {
        targetIndex = currentIndex;
      }
    } else if (direction === "prev") {
      if (currentIndex === -1) {
        targetIndex = enabled.length - 1;
      } else if (currentIndex > 0) {
        targetIndex = currentIndex - 1;
      } else if (loop) {
        targetIndex = enabled.length - 1;
      } else {
        targetIndex = currentIndex;
      }
    }

    const target = enabled[targetIndex];
    if (target) {
      highlightItem(target.value);
    }
  };

  // Typeahead search state
  let typeaheadBuffer = "";
  let typeaheadTimeout: ReturnType<typeof setTimeout> | undefined;

  const handleTypeahead = (char: string) => {
    if (char.length !== 1) return;

    if (typeaheadTimeout) {
      clearTimeout(typeaheadTimeout);
    }
    typeaheadBuffer += char.toLowerCase();
    typeaheadTimeout = setTimeout(() => {
      typeaheadBuffer = "";
    }, 500);

    const enabled = getEnabledItems();
    if (enabled.length === 0) return;

    const currentKey = highlightedValue();
    const currentIndex = currentKey ? enabled.findIndex((i) => i.value === currentKey) : -1;

    // Search wrap-around starting from next item
    const orderedSearch = [
      ...enabled.slice(currentIndex + 1),
      ...enabled.slice(0, Math.max(0, currentIndex + 1)),
    ];

    const match = orderedSearch.find((item) => {
      const text = item.getTextValue().trim().toLowerCase();
      return text.startsWith(typeaheadBuffer);
    });

    if (match) {
      highlightItem(match.value);
    }
  };

  // Root menu reference (topmost menu in hierarchy)
  let rootMenuRef: UseMenuResult | null = null;

  const result: UseMenuResult = {
    id,
    triggerId,
    contentId,
    isOpen,
    open: openMenu,
    close: closeMenu,
    toggle: toggleMenu,
    triggerRef,
    contentRef,
    popper,
    highlightedValue,
    highlightItem,
    registerItem,
    registerSubmenu,
    handleTriggerClick: (e: MouseEvent) => {
      e.preventDefault();
      toggleMenu();
    },
    handleTriggerKeyDown: (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        openMenu();
        inClient(() => {
          setTimeout(() => moveHighlight("first"), 10);
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        openMenu();
        inClient(() => {
          setTimeout(() => moveHighlight("last"), 10);
        });
      }
    },
    handleContentKeyDown: (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        moveHighlight("next");
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        moveHighlight("prev");
      } else if (e.key === "Home") {
        e.preventDefault();
        moveHighlight("first");
      } else if (e.key === "End") {
        e.preventDefault();
        moveHighlight("last");
      } else if (e.key === "ArrowRight") {
        const currentKey = highlightedValue();
        if (currentKey) {
          const item = items.get(currentKey);
          if (item?.isSubmenuTrigger && item.openSubmenu) {
            e.preventDefault();
            item.openSubmenu();
          }
        }
      } else if (e.key === "ArrowLeft") {
        if (parentMenu) {
          e.preventDefault();
          closeMenu(false);
          const parentTrigger = triggerRef();
          parentTrigger?.focus();
        }
      } else if (e.key === "Enter" || e.key === " ") {
        const currentKey = highlightedValue();
        if (currentKey) {
          const item = items.get(currentKey);
          if (item && !item.isDisabled()) {
            e.preventDefault();
            if (item.isSubmenuTrigger && item.openSubmenu) {
              item.openSubmenu();
            } else if (item.select) {
              item.select();
            }
          }
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        closeMenu(false);
        const triggerEl = triggerRef();
        triggerEl?.focus();
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        handleTypeahead(e.key);
      }
    },
    modal,
    forceMount,
    portalTarget: options.portalTarget ?? parentMenu?.portalTarget,
    containsNode: (target: Node): boolean => {
      const trigger = triggerRef();
      if (trigger && (trigger === target || trigger.contains(target))) return true;
      const content = contentRef();
      if (content && (content === target || content.contains(target))) return true;
      for (const sub of submenus) {
        if (sub.containsNode(target)) return true;
      }
      return false;
    },
    loop,
    parentMenu,
    get rootMenu() {
      if (!rootMenuRef) {
        let curr: UseMenuResult = result;
        while (curr.parentMenu) {
          curr = curr.parentMenu;
        }
        rootMenuRef = curr;
      }
      return rootMenuRef;
    },
  };

  // If this is a submenu, register with parent
  if (parentMenu) {
    onUnmounted(parentMenu.registerSubmenu(result));
  }

  // Dismiss on outside click
  const isOutsideDisabled = isOpenState.as((open) => !open || !!parentMenu);

  useInteractOutside(contentRef, {
    isDisabled: isOutsideDisabled,
    onInteractOutside: (e) => {
      const originalEv = e.detail?.originalEvent;
      const target = (originalEv?.target ?? e.target) as Node | null;
      if (!target) return;

      if (result.containsNode(target)) {
        return;
      }

      closeMenu(true);
    },
  });

  return result;
}

/**
 * Headless helper managing single-selection radio state within a Menu.
 */
export function useMenuRadioGroup(options: UseMenuRadioGroupOptions = {}): UseMenuRadioGroupResult {
  const rawValue = options.value;
  const state: Value<string> = createValue<string>(
    unwrapValue(rawValue) ?? options.defaultValue ?? "",
  );
  if (rawValue !== undefined && isValue(rawValue)) {
    rawValue.watch((next: string) => state(next ?? ""));
  }

  const value = state.as((v) => v);

  const disabledObservable = wrapValue(options.disabled ?? false);
  const isDisabled = disabledObservable.as((d) => Boolean(d));

  const setSelectedValue = (newVal: string) => {
    if (isDisabled()) return;
    state(newVal);
    options.onChange?.(newVal);
  };

  const isSelected = (val: string) => state.as((curr) => curr === val);

  return {
    value,
    setSelectedValue,
    isSelected,
    isDisabled,
  };
}

