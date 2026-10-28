import {
  type DerivedValue,
  resolvePropsAndChildren,
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
    propsOrChildren?: CollapsibleRootProps<T> | SeidrChild | SeidrChild[],
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /**
   * Pre-bound Collapsible.Trigger element.
   */
  Trigger: <T extends keyof SeidrElementTagNameMap = "button">(
    propsOrChildren?: CollapsibleTriggerProps<T> | SeidrChild | SeidrChild[],
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /**
   * Pre-bound Collapsible.Content element.
   */
  Content: <T extends keyof SeidrElementTagNameMap = "div">(
    propsOrChildren?: CollapsibleContentProps<T> | SeidrChild | SeidrChild[],
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T] | DerivedValue<SeidrElementTagNameMap[T] | null>;
}

/**
 * Creates a collapsible state instance with pre-bound compound element helpers.
 */
export function createCollapsible(options: UseCollapsibleOptions = {}): CollapsibleInstance {
  const instance = useCollapsible(options);

  return {
    ...instance,
    Root: (propsOrChildren, children) => {
      const [props, content] = resolvePropsAndChildren(propsOrChildren, children);
      return CollapsibleRoot({ instance, ...props }, content);
    },
    Trigger: (propsOrChildren, children) => {
      const [props, content] = resolvePropsAndChildren(propsOrChildren, children);
      return CollapsibleTrigger({ instance, ...props }, content);
    },
    Content: (propsOrChildren, children) => {
      const [props, content] = resolvePropsAndChildren(propsOrChildren, children);
      return CollapsibleContent({ instance, ...props }, content);
    },
  };
}
