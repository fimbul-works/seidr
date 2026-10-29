import { isUndef } from "@fimbul-works/hvat";
import {
  type CleanupFunction,
  createValue,
  type DerivedValue,
  inClient,
  type ObservableValue,
  unwrapValue,
  useId,
  type Value,
  wrapValue,
} from "@fimbul-works/seidr";
import { useControllableValue } from "../hooks/use-controllable-value.js";
import type { TabsDataSet, UseTabsOptions, UseTabsResult } from "./types.js";

interface TriggerEntry {
  key: string;
  el: HTMLElement;
  isDisabled: () => boolean;
}

/**
 * Headless reactive coordinator for an accessible WAI-ARIA Tabs collection.
 */
export function useTabs(options: UseTabsOptions = {}): UseTabsResult {
  const { id: customId, orientation = "horizontal", activationMode = "automatic", shouldFocusWrap = true } = options;

  const id = customId ?? useId("tabs");
  const disabledObservable = wrapValue(options.disabled ?? false);
  const isDisabled: DerivedValue<boolean> = disabledObservable.as((d) => !!d);

  const internalState = useControllableValue<string>({
    value: options.value,
    defaultValue: options.defaultValue ?? "",
    onChange: options.onChange,
  });

  const focusedKey: Value<string> = createValue(internalState());

  // Keep focusedKey in sync when active tab changes externally
  internalState.watch((nextKey) => {
    focusedKey(nextKey);
  });

  const selectedTabElement: Value<HTMLElement | null> = createValue<HTMLElement | null>(null);

  const triggers: TriggerEntry[] = [];

  const isSelected = (key: string): DerivedValue<boolean> => {
    return internalState.as((current) => current === key);
  };

  const setSelectedValue = (nextKey: string) => {
    if (isDisabled()) return;

    const entry = triggers.find((t) => t.key === nextKey);
    if (entry?.isDisabled()) return;

    internalState(nextKey);
    focusedKey(nextKey);

    if (entry?.el) {
      selectedTabElement(entry.el);
    }
  };

  const registerTrigger = (
    key: string,
    el: HTMLElement,
    disabledProp?: boolean | ObservableValue<boolean>,
  ): CleanupFunction => {
    const isItemDisabled = () => {
      if (isDisabled()) return true;
      if ((el as HTMLButtonElement).disabled) return true;
      if (!isUndef(disabledProp)) {
        return !!unwrapValue(disabledProp);
      }
      return false;
    };

    const entry: TriggerEntry = { key, el, isDisabled: isItemDisabled };
    triggers.push(entry);

    // If this newly registered trigger matches the current value or is the initial fallback
    if (internalState() === key || (!internalState() && !isItemDisabled())) {
      if (!internalState()) {
        internalState(key);
        focusedKey(key);
      }
      selectedTabElement(el);
    }

    return () => {
      const idx = triggers.indexOf(entry);
      if (idx !== -1) {
        triggers.splice(idx, 1);
      }
      if (selectedTabElement() === el) {
        selectedTabElement(null);
      }
    };
  };

  const generateTriggerId = (key: string) => `${id}-trigger-${key}`;
  const generateContentId = (key: string) => `${id}-content-${key}`;

  const handleKeyDown = (e: KeyboardEvent, currentKey: string) => {
    const isHorizontal = orientation === "horizontal";
    const nextKey = isHorizontal ? "ArrowRight" : "ArrowDown";
    const prevKey = isHorizontal ? "ArrowLeft" : "ArrowUp";

    if (
      e.key !== nextKey &&
      e.key !== prevKey &&
      e.key !== "Home" &&
      e.key !== "End" &&
      e.key !== "Enter" &&
      e.key !== " "
    ) {
      return;
    }

    inClient(() => {
      // Manual selection on Enter or Space
      if (e.key === "Enter" || e.key === " ") {
        if (activationMode === "manual") {
          e.preventDefault();
          setSelectedValue(currentKey);
        }
        return;
      }

      // Filter to connected and enabled triggers sorted by document layout order
      const validTriggers = triggers
        .filter((t) => t.el.isConnected && !t.isDisabled())
        .sort((a, b) => {
          if (a.el === b.el) return 0;
          return a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_PRECEDING ? 1 : -1;
        });

      if (validTriggers.length === 0) return;

      const currentIndex = validTriggers.findIndex((t) => t.key === currentKey);
      let targetIndex = currentIndex;

      if (e.key === nextKey) {
        e.preventDefault();
        if (currentIndex === -1) {
          targetIndex = 0;
        } else if (shouldFocusWrap) {
          targetIndex = (currentIndex + 1) % validTriggers.length;
        } else {
          targetIndex = Math.min(currentIndex + 1, validTriggers.length - 1);
        }
      } else if (e.key === prevKey) {
        e.preventDefault();
        if (currentIndex === -1) {
          targetIndex = validTriggers.length - 1;
        } else if (shouldFocusWrap) {
          targetIndex = (currentIndex - 1 + validTriggers.length) % validTriggers.length;
        } else {
          targetIndex = Math.max(currentIndex - 1, 0);
        }
      } else if (e.key === "Home") {
        e.preventDefault();
        targetIndex = 0;
      } else if (e.key === "End") {
        e.preventDefault();
        targetIndex = validTriggers.length - 1;
      }

      const targetEntry = validTriggers[targetIndex];
      if (!targetEntry) return;

      targetEntry.el.focus();
      focusedKey(targetEntry.key);

      if (activationMode === "automatic") {
        setSelectedValue(targetEntry.key);
      }
    });
  };

  const dataset: TabsDataSet = {
    "data-orientation": orientation,
    ...(isDisabled() ? { "data-disabled": "" } : {}),
  };

  return {
    id,
    value: internalState.as((v) => v),
    selectedValue: () => internalState(),
    setSelectedValue,
    orientation,
    activationMode,
    isDisabled,
    shouldFocusWrap,
    isSelected,
    focusedKey,
    generateTriggerId,
    generateContentId,
    registerTrigger,
    selectedTabElement,
    handleKeyDown,
    dataset,
  };
}
