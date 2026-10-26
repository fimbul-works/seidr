import { unwrapValue, type Value } from "@fimbul-works/seidr";
import { useControllableBooleanValue } from "./use-controllable-value.js";

export interface UseToggleStateProps {
  /** The controlled selected state. */
  isSelected?: boolean | Value<boolean>;

  /** The default selected state when initially rendered (uncontrolled). */
  defaultIsSelected?: boolean | Value<boolean>;

  /** Whether the selected state cannot be changed by the user. */
  isDisabled?: boolean | Value<boolean>;

  /** Whether the selected state is read-only. */
  isReadOnly?: boolean | Value<boolean>;

  /** Event handler called when the selected state changes. */
  onSelectedChange?: (isSelected: boolean) => void;
}

export interface UseToggleStateResult {
  /** The selected state. */
  isSelected: Value<boolean>;

  /** Updates the selected state. */
  setIsSelected: (isSelected: boolean) => void;

  /** Toggle the selected state. */
  toggle: () => void;
}

/**
 * Provides state management for toggle components like checkboxes, switches, and toggle buttons.
 *
 * Ported from Kobalte's createToggleState primitive.
 */
export function useToggleState(props: UseToggleStateProps = {}): UseToggleStateResult {
  const isSelected = useControllableBooleanValue({
    value: props.isSelected,
    defaultValue: unwrapValue(props.defaultIsSelected) ?? false,
    onChange: props.onSelectedChange,
  });

  const isBlocked = () => !!(unwrapValue(props.isReadOnly) || unwrapValue(props.isDisabled));

  return {
    isSelected,
    setIsSelected(value: boolean) {
      if (!isBlocked()) {
        isSelected(value);
      }
    },
    toggle() {
      if (!isBlocked()) {
        isSelected((prev) => !prev);
      }
    },
  };
}
