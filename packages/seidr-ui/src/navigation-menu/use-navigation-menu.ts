import {
  createRef,
  createValue,
  type DerivedValue,
  inClient,
  type ObservableValue,
  onUnmounted,
  type Ref,
  useId,
  type Value,
  wrapValue,
} from "@fimbul-works/seidr";
import { useInteractOutside } from "../hooks/use-interact-outside.js";
import type {
  MenubarMenuRegistration,
  MenubarOrientation,
} from "../menubar/types.js";
import type {
  UseNavigationMenuOptions,
  UseNavigationMenuResult,
} from "./types.js";

/**
 * Headless coordinator hook for a NavigationMenu system.
 */
export function useNavigationMenu(
  options: UseNavigationMenuOptions = {},
): UseNavigationMenuResult {
  const id = options.id ?? useId("nav-menu");
  const dataComponent = options.dataComponent ?? "navigation-menu";
  const delayDuration = options.delayDuration ?? 200;
  const skipDelayDuration = options.skipDelayDuration ?? 300;
  const loop = options.loop ?? true;
  const orientation: ObservableValue<MenubarOrientation> = wrapValue(options.orientation ?? "horizontal");

  const valueState: Value<string | null> = options.value
    ? (wrapValue(options.value) as Value<string | null>)
    : createValue<string | null>(options.defaultValue ?? null);

  const activeTrigger = createValue<string | null>(options.defaultValue ?? null);
  const isOpen: DerivedValue<boolean> = valueState.as((v) => v !== null);

  const rootRef = createRef<HTMLElement>();
  const viewportRef = createRef<HTMLElement>();
  const registrations = new Map<string, MenubarMenuRegistration>();

  let hoverTimerId: ReturnType<typeof setTimeout> | undefined;
  let leaveTimerId: ReturnType<typeof setTimeout> | undefined;

  const cancelTimers = () => {
    if (hoverTimerId !== undefined) {
      clearTimeout(hoverTimerId);
      hoverTimerId = undefined;
    }
    if (leaveTimerId !== undefined) {
      clearTimeout(leaveTimerId);
      leaveTimerId = undefined;
    }
  };

  onUnmounted(cancelTimers);

  if (options.onValueChange) {
    valueState.watch((v) => {
      options.onValueChange?.(v);
    });
  }

  const getRegisteredEntries = (): MenubarMenuRegistration[] => {
    const rootEl = rootRef();
    if (rootEl && inClient(() => true)) {
      const triggers = Array.from(
        rootEl.querySelectorAll<HTMLElement>(
          "[data-part='trigger'], [data-part='link']",
        ),
      );
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
    cancelTimers();
    const reg = registrations.get(menuValue);
    if (!reg || reg.isDisabled()) return;

    activeTrigger(menuValue);
    valueState(menuValue);
    reg.open(autoFocusFirst);
  };

  const closeMenu = () => {
    cancelTimers();
    const currentVal = valueState();
    if (currentVal) {
      const reg = registrations.get(currentVal);
      reg?.close();
      valueState(null);
    }
  };

  const startHoverTimer = (menuValue: string) => {
    cancelTimers();
    const reg = registrations.get(menuValue);
    if (!reg || reg.isDisabled()) return;

    // Grace period / skip delay: if already open, switch immediately without waiting 200ms!
    if (isOpen()) {
      openMenu(menuValue);
      return;
    }

    hoverTimerId = setTimeout(() => {
      openMenu(menuValue);
    }, delayDuration);
  };

  const startLeaveTimer = () => {
    cancelTimers();
    leaveTimerId = setTimeout(() => {
      closeMenu();
    }, skipDelayDuration);
  };

  const navigateToMenu = (
    targetReg: MenubarMenuRegistration | undefined,
    shouldOpen: boolean,
  ) => {
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

  const handleListKeyDown = (e: KeyboardEvent) => {
    const isHorizontal = orientation() === "horizontal";
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
      const viewportEl = viewportRef();
      if (viewportEl && viewportEl.contains(target)) return true;

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

  return {
    id,
    dataComponent,
    value: valueState,
    activeTrigger,
    orientation,
    portalTarget: options.portalTarget,
    isOpen,
    delayDuration,
    skipDelayDuration,
    openMenu,
    closeMenu,
    nextMenu,
    prevMenu,
    firstMenu,
    lastMenu,
    startHoverTimer,
    startLeaveTimer,
    cancelTimers,
    registerMenu,
    handleListKeyDown,
    rootRef,
    viewportRef,
  };
}

