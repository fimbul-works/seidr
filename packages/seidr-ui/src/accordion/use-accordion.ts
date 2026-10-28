import { isArr, isFn, isUndef } from "@fimbul-works/hvat";
import {
  type CleanupFunction,
  createValue,
  type DerivedValue,
  inClient,
  isValue,
  type ObservableValue,
  unwrapValue,
  useId,
  type Value,
} from "@fimbul-works/seidr";
import type { UseAccordionOptions, UseAccordionResult } from "./types.js";

interface TriggerEntry {
  key: string;
  el: HTMLElement;
  isDisabled: () => boolean;
}

/**
 * Headless reactive coordinator for a vertically stacked Accordion disclosure collection.
 */
export function useAccordion(options: UseAccordionOptions = {}): UseAccordionResult {
  const {
    value,
    defaultValue,
    onChange,
    multiple = false,
    collapsible = false,
    shouldFocusWrap = true,
    id: customId,
  } = options;

  const id = customId ?? useId("accordion");

  const isControlled = !isUndef(value);
  const isControlledValue = isValue(value);
  const isControlledStatic = isControlled && !isControlledValue;

  const initialValues = isControlledStatic
    ? (value as string[])
    : (defaultValue ?? []);

  const state: Value<string[]> = isControlledValue
    ? (value as Value<string[]>)
    : createValue(isArr(initialValues) ? initialValues : []);

  if (isFn(onChange)) {
    state.watch((next) => onChange(next));
  }

  const derivedValue: DerivedValue<string[]> = state.as((v) => (isArr(v) ? v : []));

  const setValue = (nextKeys: string[]) => {
    // In single, non-collapsible mode, empty selection is not allowed.
    if (!multiple && !collapsible && nextKeys.length === 0) {
      return;
    }

    const current = state();
    if (
      current.length === nextKeys.length &&
      current.every((k, i) => k === nextKeys[i])
    ) {
      return;
    }

    if (isControlledStatic) {
      onChange?.(nextKeys);
    } else {
      state(nextKeys);
    }
  };

  const isOpen = (key: string): DerivedValue<boolean> => {
    return state.as((keys) => (isArr(keys) ? keys.includes(key) : false));
  };

  const toggle = (key: string) => {
    const current = state();
    const isCurrentlyOpen = current.includes(key);

    if (multiple) {
      if (isCurrentlyOpen) {
        setValue(current.filter((k) => k !== key));
      } else {
        setValue([...current, key]);
      }
    } else {
      if (isCurrentlyOpen) {
        if (collapsible) {
          setValue([]);
        }
      } else {
        setValue([key]);
      }
    }
  };

  const expand = (key: string) => {
    const current = state();
    if (current.includes(key)) return;

    if (multiple) {
      setValue([...current, key]);
    } else {
      setValue([key]);
    }
  };

  const collapse = (key: string) => {
    const current = state();
    if (!current.includes(key)) return;

    if (multiple) {
      setValue(current.filter((k) => k !== key));
    } else if (collapsible) {
      setValue([]);
    }
  };

  // Keyboard navigation & trigger button registry
  const triggers: TriggerEntry[] = [];

  const registerTrigger = (
    key: string,
    el: HTMLElement,
    disabledProp?: boolean | ObservableValue<boolean>,
  ): CleanupFunction => {
    const isDisabled = () => {
      if ((el as HTMLButtonElement).disabled) return true;
      if (!isUndef(disabledProp)) {
        return !!unwrapValue(disabledProp);
      }
      return false;
    };

    const entry: TriggerEntry = { key, el, isDisabled };
    triggers.push(entry);

    return () => {
      const idx = triggers.indexOf(entry);
      if (idx !== -1) {
        triggers.splice(idx, 1);
      }
    };
  };

  const handleKeyDown = (e: KeyboardEvent, currentKey: string) => {
    const supportedKeys = ["ArrowDown", "ArrowUp", "Home", "End"];
    if (!supportedKeys.includes(e.key)) {
      return;
    }

    inClient(() => {
      // Filter out detached or disabled triggers and sort them according to DOM position
      const validTriggers = triggers
        .filter((t) => t.el.isConnected && !t.isDisabled())
        .sort((a, b) => {
          if (a.el === b.el) return 0;
          return a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_PRECEDING ? 1 : -1;
        });

      if (validTriggers.length === 0) return;

      const currentIndex = validTriggers.findIndex((t) => t.key === currentKey);
      let targetIndex = currentIndex;

      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          if (currentIndex === -1) {
            targetIndex = 0;
          } else if (shouldFocusWrap) {
            targetIndex = (currentIndex + 1) % validTriggers.length;
          } else {
            targetIndex = Math.min(currentIndex + 1, validTriggers.length - 1);
          }
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          if (currentIndex === -1) {
            targetIndex = validTriggers.length - 1;
          } else if (shouldFocusWrap) {
            targetIndex = (currentIndex - 1 + validTriggers.length) % validTriggers.length;
          } else {
            targetIndex = Math.max(currentIndex - 1, 0);
          }
          break;
        }
        case "Home": {
          e.preventDefault();
          targetIndex = 0;
          break;
        }
        case "End": {
          e.preventDefault();
          targetIndex = validTriggers.length - 1;
          break;
        }
      }

      validTriggers[targetIndex]?.el.focus();
    });
  };

  return {
    id,
    value: derivedValue,
    multiple,
    collapsible,
    shouldFocusWrap,
    setValue,
    isOpen,
    toggle,
    expand,
    collapse,
    registerTrigger,
    handleKeyDown,
  };
}
