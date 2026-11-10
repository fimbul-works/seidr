import { isFn } from "@fimbul-works/hvat";
import {
  createRef,
  createValue,
  type DerivedValue,
  inClient,
  onMounted,
  onUnmounted,
  type Ref,
  useId,
  type Value,
  wrapValue,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_MENUBAR } from "../constants.js";
import { useInteractOutside } from "../hooks/use-interact-outside.js";
import type { MenubarMenuRegistration, MenubarOrientation, UseMenubarOptions, UseMenubarResult } from "./types.js";

/**
 * Headless coordinator hook for a Menubar system.
 */
export function useMenubar(options: UseMenubarOptions = {}): UseMenubarResult {
  const id = options.id ?? useId("menubar");
  const dataComponent = options.dataComponent ?? DATA_COMPONENT_MENUBAR;
  const loop = options.loop ?? true;
  const orientation: MenubarOrientation = options.orientation ?? "horizontal";
  const focusOnAlt = options.focusOnAlt ?? false;

  const valueState: Value<string | null> = options.value
    ? (wrapValue(options.value) as Value<string | null>)
    : createValue<string | null>(options.defaultValue ?? null);

  const activeTrigger = createValue<string | null>(options.defaultValue ?? null);
  const isOpen: DerivedValue<boolean> = valueState.as((v) => v !== null);

  const rootRef = createRef<HTMLElement>();
  const registrations = new Map<string, MenubarMenuRegistration>();

  if (options.onValueChange) {
    valueState.watch((v) => {
      options.onValueChange?.(v);
    });
  }

  const getRegisteredEntries = (): MenubarMenuRegistration[] => {
    // If root element is mounted in DOM, sort registrations according to DOM order
    const rootEl = rootRef();
    if (rootEl && inClient(() => true)) {
      const triggers = Array.from(rootEl.querySelectorAll<HTMLElement>("[data-part='trigger']"));
      if (triggers.length > 0) {
        return Array.from(registrations.values()).sort((a, b) => {
          const elA = a.getTriggerElement();
          const elB = b.getTriggerElement();
          if (!elA || !elB) return 0;
          return triggers.indexOf(elA) - triggers.indexOf(elB);
        });
      }
    }
    return Array.from(registrations.values());
  };

  const getEnabledRegistrations = (): MenubarMenuRegistration[] => {
    return getRegisteredEntries().filter((reg) => !reg.isDisabled());
  };

  const registerMenu = (reg: MenubarMenuRegistration): (() => void) => {
    registrations.set(reg.value, reg);
    if (!activeTrigger() && !reg.isDisabled()) {
      activeTrigger(reg.value);
    }

    return () => {
      registrations.delete(reg.value);
      if (activeTrigger() === reg.value) {
        const remaining = getEnabledRegistrations();
        activeTrigger(remaining.length > 0 ? remaining[0].value : null);
      }
      if (valueState() === reg.value) {
        valueState(null);
      }
    };
  };

  const openMenu = (menuValue: string, autoFocusFirst: boolean = false) => {
    const reg = registrations.get(menuValue);
    if (!reg || reg.isDisabled()) return;

    activeTrigger(menuValue);
    valueState(menuValue);
    reg.open(autoFocusFirst);
  };

  const closeMenu = () => {
    const currentVal = valueState();
    if (currentVal) {
      const reg = registrations.get(currentVal);
      reg?.close();
      valueState(null);
    }
  };

  const navigateToMenu = (targetReg: MenubarMenuRegistration | undefined, shouldOpen: boolean) => {
    if (!targetReg) return;
    activeTrigger(targetReg.value);
    targetReg.focusTrigger();

    if (shouldOpen) {
      openMenu(targetReg.value);
    }
  };

  const nextMenu = (shouldOpen: boolean = isOpen()) => {
    const enabled = getEnabledRegistrations();
    if (enabled.length === 0) return;

    const currentKey = activeTrigger() ?? enabled[0].value;
    const currentIndex = enabled.findIndex((r) => r.value === currentKey);

    let nextIndex = currentIndex + 1;
    if (nextIndex >= enabled.length) {
      if (!loop) return;
      nextIndex = 0;
    }

    navigateToMenu(enabled[nextIndex], shouldOpen);
  };

  const prevMenu = (shouldOpen: boolean = isOpen()) => {
    const enabled = getEnabledRegistrations();
    if (enabled.length === 0) return;

    const currentKey = activeTrigger() ?? enabled[0].value;
    const currentIndex = enabled.findIndex((r) => r.value === currentKey);

    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      if (!loop) return;
      prevIndex = enabled.length - 1;
    }

    navigateToMenu(enabled[prevIndex], shouldOpen);
  };

  const firstMenu = () => {
    const enabled = getEnabledRegistrations();
    if (enabled.length > 0) {
      navigateToMenu(enabled[0], isOpen());
    }
  };

  const lastMenu = () => {
    const enabled = getEnabledRegistrations();
    if (enabled.length > 0) {
      navigateToMenu(enabled[enabled.length - 1], isOpen());
    }
  };

  const handleRootKeyDown = (e: KeyboardEvent) => {
    const isHorizontal = orientation === "horizontal";
    const nextKey = isHorizontal ? "ArrowRight" : "ArrowDown";
    const prevKey = isHorizontal ? "ArrowLeft" : "ArrowUp";

    switch (e.key) {
      case nextKey:
        e.preventDefault();
        e.stopPropagation();
        nextMenu(isOpen());
        break;
      case prevKey:
        e.preventDefault();
        e.stopPropagation();
        prevMenu(isOpen());
        break;
      case "Home":
        e.preventDefault();
        e.stopPropagation();
        firstMenu();
        break;
      case "End":
        e.preventDefault();
        e.stopPropagation();
        lastMenu();
        break;
      case "Escape":
        if (isOpen()) {
          e.preventDefault();
          e.stopPropagation();
          const currentKey = valueState();
          closeMenu();
          if (currentKey) {
            registrations.get(currentKey)?.focusTrigger();
          }
        }
        break;
    }
  };

  // Outside click dismissal
  useInteractOutside(rootRef, {
    isDisabled: isOpen.as((open) => !open),
    onInteractOutside: () => {
      if (isOpen()) {
        closeMenu();
      }
    },
    shouldExcludeElement: (target) => {
      if (!target) return false;
      const rootEl = rootRef();
      if (rootEl && rootEl.contains(target)) return true;

      for (const reg of registrations.values()) {
        if (reg.containsTarget?.(target)) return true;
        const triggerEl = reg.getTriggerElement();
        if (triggerEl && triggerEl.contains(target)) return true;
        const contentEl = reg.getContentElement?.();
        if (contentEl && contentEl.contains(target)) return true;
      }
      return false;
    },
  });

  // Alt key focus handling
  inClient(() => {
    if (!focusOnAlt) return;

    const handleAltKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Alt" && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        if (isOpen()) {
          closeMenu();
        } else {
          const current = activeTrigger();
          if (current && registrations.has(current)) {
            registrations.get(current)?.focusTrigger();
          } else {
            firstMenu();
          }
        }
      }
    };

    window.addEventListener("keydown", handleAltKeyDown);
    onUnmounted(() => {
      window.removeEventListener("keydown", handleAltKeyDown);
    });
  });

  return {
    id,
    dataComponent,
    value: valueState,
    activeTrigger,
    orientation,
    portalTarget: options.portalTarget,
    isOpen,
    openMenu,
    closeMenu,
    nextMenu,
    prevMenu,
    firstMenu,
    lastMenu,
    registerMenu,
    handleRootKeyDown,
    rootRef,
  };
}
