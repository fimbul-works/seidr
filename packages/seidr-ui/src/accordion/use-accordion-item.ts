import {
  createValue,
  type DerivedValue,
  isValue,
  type ObservableValue,
  useId,
} from "@fimbul-works/seidr";
import { useCollapsible } from "../collapsible/use-collapsible.js";
import type { AccordionDataSet, AccordionItemInstance, AccordionItemOptions, UseAccordionResult } from "./types.js";

/**
 * Creates an item-level coordinator for an accordion panel.
 */
export function useAccordionItem(
  accordion: UseAccordionResult,
  options: AccordionItemOptions,
): AccordionItemInstance {
  const { value, disabled, forceMount, id: customId } = options;

  const id = customId ?? `${accordion.id}-item-${value}`;
  const triggerId = createValue<string>(`${id}-trigger`);
  const contentId = createValue<string>(`${id}-content`);

  const isOpen: DerivedValue<boolean> = accordion.isOpen(value);
  const isDisabled: ObservableValue<boolean> = isValue(disabled)
    ? disabled.as((d) => !!d)
    : createValue(!!disabled);

  const dataset: AccordionDataSet = {
    "data-expanded": isOpen.as((v) => (v ? "" : undefined)),
    "data-closed": isOpen.as((v) => (!v ? "" : undefined)),
    "data-disabled": isDisabled.as((v) => (v ? "" : undefined)),
  };

  const collapsibleInstance = useCollapsible({
    open: isOpen,
    disabled: isDisabled,
    forceMount,
    id,
  });

  // Ensure contentId matches collapsibleInstance's contentId
  collapsibleInstance.contentId.bind((newContentId: string) => {
    contentId(newContentId);
  });

  const toggle = () => {
    accordion.toggle(value);
  };

  return {
    value,
    isOpen,
    isDisabled,
    triggerId,
    contentId,
    dataset,
    collapsibleInstance,
    toggle,
    accordion,
  };
}
