import { $, type SeidrChild, type SeidrElementProps, type SeidrElementTagNameMap } from "@fimbul-works/seidr";
import type { UseCollapsibleResult } from "./types.js";
import { type UseCollapsibleOptions, useCollapsible } from "./use-collapsible.js";
import { SeidrError } from "@fimbul-works/seidr";

export interface CollapsibleRootOptions<T extends keyof SeidrElementTagNameMap = "div"> extends UseCollapsibleOptions {
  /**
   * The HTML element tag name to render.
   * @default "div"
   */
  as?: T;

  /**
   * Explicit instance providing reactive state.
   */
  instance?: UseCollapsibleResult;
}

export type CollapsibleRootProps<T extends keyof SeidrElementTagNameMap = "div"> = CollapsibleRootOptions<T> &
  SeidrElementProps<T>;

/**
 * CollapsibleRoot is the top-level container for a collapsible disclosure widget.
 */
export function CollapsibleRoot<T extends keyof SeidrElementTagNameMap = "div">(
  props: CollapsibleRootProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "div" as T, open, defaultOpen, onOpenChange, disabled, forceMount, id, instance: col, ...rest } = props;

  if (!col) {
    throw new SeidrError("CollapsibleRoot requires an instance prop");
  }

  return $(
    as,
    {
      id: col.id,
      dataComponent: "collapsible",
      dataPart: "root",
      ...col.dataset,
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
