import {
  $,
  resolvePropsAndChildren,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
} from "@fimbul-works/seidr";
import type { UseCollapsibleResult } from "./types.js";
import { type UseCollapsibleOptions, useCollapsible } from "./use-collapsible.js";

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
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function CollapsibleRoot<T extends keyof SeidrElementTagNameMap = "div">(
  props?: CollapsibleRootProps<T> | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function CollapsibleRoot<T extends keyof SeidrElementTagNameMap = "div">(
  propsOrChildren?: CollapsibleRootProps<T> | SeidrChild | SeidrChild[] | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const [props, content] = resolvePropsAndChildren<CollapsibleRootProps<T>>(propsOrChildren, children);

  const {
    as = "div" as T,
    open,
    defaultOpen,
    onOpenChange,
    disabled,
    forceMount,
    id,
    instance,
    ...rest
  } = props as any;

  const col =
    instance ??
    useCollapsible({
      open,
      defaultOpen,
      onOpenChange,
      disabled,
      forceMount,
      id,
    });

  return $(
    as as keyof SeidrElementTagNameMap,
    {
      id: col.id,
      ...col.dataset,
      ...rest,
    } as SeidrElementProps<any>,
    content,
  ) as SeidrElementTagNameMap[T];
}
