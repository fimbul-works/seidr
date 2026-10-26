import type { CleanupFunction, Value } from "@fimbul-works/seidr";
import { createContext } from "../utils/create-context.js";

export interface CollapsibleDataSet {
  "data-expanded": Value<string | undefined>;
  "data-closed": Value<string | undefined>;
  "data-disabled": Value<string | undefined>;
}

export interface UseCollapsibleResult {
  /** The derived read-only open state. */
  isOpen: Value<boolean>;

  /** The derived read-only disabled state. */
  isDisabled: Value<boolean>;

  /** Whether the collapsible is force mounted in the DOM. */
  forceMount: boolean;

  /** The base ID of the collapsible. */
  id: string;

  /** The reactive content ID. */
  contentId: Value<string>;

  /** Registers or overrides the content element ID. */
  registerContentId: (id: string) => CleanupFunction;

  /** Sets the open state manually (guarded by disabled). */
  setIsOpen: (next: boolean | ((prev: boolean) => boolean)) => void;

  /** Opens the collapsible (guarded by disabled). */
  open: () => void;

  /** Closes the collapsible (guarded by disabled). */
  close: () => void;

  /** Toggles the collapsible open/closed (guarded by disabled). */
  toggle: () => void;

  /** Reactive data-* attributes for Root, Trigger, and Content. */
  dataset: CollapsibleDataSet;
}

export const collapsibleContext = createContext<UseCollapsibleResult>("Collapsible");
