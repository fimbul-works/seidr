import {
  $,
  type DerivedValue,
  mergeValues,
  onUnmounted,
  resolvePropsAndChildren,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
  Show,
  unwrapValue,
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
}

export type CollapsibleContentProps<T extends keyof SeidrElementTagNameMap = "div"> = CollapsibleContentOptions<T> &
  SeidrElementProps<T>;

/**
 * Contains the content to be rendered when the collapsible is expanded.
 */
export function CollapsibleContent<T extends keyof SeidrElementTagNameMap = "div">(
  children?: SeidrChild | SeidrChild[],
): DerivedValue<SeidrElementTagNameMap[T] | null>;
export function CollapsibleContent<T extends keyof SeidrElementTagNameMap = "div">(
  props: CollapsibleContentProps<T>,
  children?: SeidrChild | SeidrChild[],
): DerivedValue<SeidrElementTagNameMap[T] | null>;
export function CollapsibleContent<T extends keyof SeidrElementTagNameMap = "div">(
  propsOrChildren?: CollapsibleContentProps<T> | SeidrChild | SeidrChild[],
  children?: SeidrChild | SeidrChild[],
): DerivedValue<SeidrElementTagNameMap[T] | null> {
  const [props, content] = resolvePropsAndChildren<CollapsibleContentProps<T>>(propsOrChildren, children);

  const { as = "div" as T, instance, forceMount, id: customId, ...rest } = props as any;

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

  const elementProps = {
    id: resolvedContentId,
    ...col.dataset,
    ...rest,
  };

  const condition = mergeValues(() => Boolean(unwrapValue(forceMount ?? col.forceMount) || col.isOpen()), {
    parents: [forceMount, col.forceMount, col.isOpen],
  });

  return Show(condition, () =>
    $(
      as as T,
      {
        hidden: col.isOpen.as((v: boolean) => !v),
        ...elementProps,
      } as SeidrElementProps<T>,
      content,
    ),
  ) as DerivedValue<SeidrElementTagNameMap[T] | null>;
}
