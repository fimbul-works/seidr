import {
  type DerivedValue,
  type SeidrChild,
  type SeidrElementTagNameMap,
} from "@fimbul-works/seidr";
import { CollapsibleContent, type CollapsibleContentProps } from "./collapsible-content.js";
import { CollapsibleRoot, type CollapsibleRootProps } from "./collapsible-root.js";
import { CollapsibleTrigger, type CollapsibleTriggerProps } from "./collapsible-trigger.js";
import type { UseCollapsibleResult } from "./types.js";
import { type UseCollapsibleOptions, useCollapsible } from "./use-collapsible.js";

export interface CollapsibleInstance extends UseCollapsibleResult {
  /**
   * Pre-bound Collapsible.Root container.
   */
  Root: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: CollapsibleRootProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /**
   * Pre-bound Collapsible.Trigger element.
   */
  Trigger: <T extends keyof SeidrElementTagNameMap = "button">(
    props?: CollapsibleTriggerProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /**
   * Pre-bound Collapsible.Content element.
   */
  Content: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: CollapsibleContentProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => DerivedValue<SeidrElementTagNameMap[T] | null>;
}

/**
 * Creates a collapsible state instance with pre-bound compound element helpers.
 */
export function createCollapsible(options: UseCollapsibleOptions = {}): CollapsibleInstance {
  const instance = useCollapsible(options);

  return {
    ...instance,
    Root: (props = {}, children) => CollapsibleRoot({ instance, ...props }, children),
    Trigger: (props = {} as CollapsibleTriggerProps<any>, children) => CollapsibleTrigger({ instance, ...props }, children),
    Content: (props = {}, children) => CollapsibleContent({ instance, ...props }, children),
  };
}
