import {
  $,
  onUnmounted,
  resolvePropsAndChildren,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
  Show,
  type Value,
} from "@fimbul-works/seidr";
import type { UseCollapsibleResult } from "./types.js";

export interface CollapsibleContentOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  /**
   * The HTML element tag name to render.
   * @default "div"
   */
  as?: T;

  /**
   * Explicit instance providing reactive state.
   */
  instance?: UseCollapsibleResult;

  /**
   * Keep mounted in the DOM when closed. Falls back to instance.forceMount.
   */
  forceMount?: boolean;
}

export type CollapsibleContentProps<T extends keyof SeidrElementTagNameMap = "div"> = CollapsibleContentOptions<T> &
  SeidrElementProps<T>;

/**
 * Contains the content to be rendered when the collapsible is expanded.
 */
export function CollapsibleContent<T extends keyof SeidrElementTagNameMap = "div">(
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] | Value<SeidrElementTagNameMap[T] | null>;
export function CollapsibleContent<T extends keyof SeidrElementTagNameMap = "div">(
  props?: CollapsibleContentProps<T> | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] | Value<SeidrElementTagNameMap[T] | null>;
export function CollapsibleContent<T extends keyof SeidrElementTagNameMap = "div">(
  propsOrChildren?: CollapsibleContentProps<T> | SeidrChild | SeidrChild[] | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] | Value<SeidrElementTagNameMap[T] | null> {
  const [props, content] = resolvePropsAndChildren<CollapsibleContentProps<T>>(propsOrChildren, children);

  const { as = "div" as T, instance, forceMount: propsForceMount, id: customId, ...rest } = props as any;

  const col = instance;
  if (!col) {
    throw new SeidrError(
      "[seidr-ui]: CollapsibleContent requires an instance prop or must be created via Collapsible.create() / Collapsible.",
    );
  }

  if (customId) {
    onUnmounted(col.registerContentId(customId));
  }

  const resolvedContentId = customId ?? col.contentId();
  const shouldForceMount = propsForceMount ?? col.forceMount;

  const elementProps = {
    id: resolvedContentId,
    ...col.dataset,
    ...rest,
  };

  if (shouldForceMount) {
    return $(
      as as keyof SeidrElementTagNameMap,
      {
        hidden: col.isOpen.as((v: boolean) => !v),
        ...elementProps,
      } as SeidrElementProps<any>,
      content,
    ) as SeidrElementTagNameMap[T];
  }

  return Show(
    col.isOpen,
    () =>
      $(
        as as keyof SeidrElementTagNameMap,
        elementProps as SeidrElementProps<any>,
        content,
      ) as SeidrElementTagNameMap[T],
  ) as Value<SeidrElementTagNameMap[T] | null>;
}
