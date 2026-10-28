import type { SeidrChild, SeidrElementTagNameMap } from "@fimbul-works/seidr";
import { type CollapsibleContentProps } from "./collapsible-content.js";
import { type CollapsibleRootProps } from "./collapsible-root.js";
import { type CollapsibleTriggerProps } from "./collapsible-trigger.js";
import { createCollapsible } from "./create-collapsible.js";
import type { UseCollapsibleOptions } from "./use-collapsible.js";
import { createComponent } from "@fimbul-works/seidr";
import { CollapsibleAnimationOptions } from "./types.js";

export interface CollapsibleProps<
  TRoot extends keyof SeidrElementTagNameMap = "div",
  TTrigger extends keyof SeidrElementTagNameMap = "button",
  TContent extends keyof SeidrElementTagNameMap = "div",
> extends UseCollapsibleOptions {
  /** Tag for root container. Default "div". */
  as?: TRoot;
  /** Props for root container. */
  rootProps?: Omit<
    CollapsibleRootProps<TRoot>,
    "open" | "defaultOpen" | "onOpenChange" | "disabled" | "forceMount" | "id"
  >;
  /** Content for trigger. */
  trigger?: SeidrChild | SeidrChild[];
  /** Props for trigger button. */
  triggerProps?: CollapsibleTriggerProps<TTrigger>;
  /** Content for the collapsible panel. */
  children?: SeidrChild | SeidrChild[];
  /** Animation configuration using Flaedi. */
  animation?: boolean | CollapsibleAnimationOptions;
  /** Props for content panel. */
  contentProps?: CollapsibleContentProps<TContent>;
}

/**
 * Collapsible component.
 */
export const Collapsible = createComponent(<
  TRoot extends keyof SeidrElementTagNameMap = "div",
  TTrigger extends keyof SeidrElementTagNameMap = "button",
  TContent extends keyof SeidrElementTagNameMap = "div",
>(props: CollapsibleProps<TRoot, TTrigger, TContent>): SeidrElementTagNameMap[TRoot] => {
  const {
    open,
    defaultOpen,
    onOpenChange,
    disabled,
    forceMount,
    id,
    as = "div" as TRoot,
    rootProps = {},
    trigger,
    triggerProps = {},
    children,
    animation,
    contentProps = {},
  } = props;

  const col = createCollapsible({
    open,
    defaultOpen,
    onOpenChange,
    disabled,
    forceMount,
    id,
  });

  return col.Root({ as, ...rootProps } as CollapsibleRootProps<TRoot>, [
    col.Trigger(triggerProps, trigger),
    col.Content({ animation, ...contentProps }, children),
  ]);
}, "Collapsible")
